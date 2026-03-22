<script setup lang="ts">
import { ref } from 'vue';
import type { Ticket } from '../types/ticket';
import { retryAiAnalysis, deleteTicket } from '../api/tickets';
import { useToast } from '../composables/useToast';
import TicketStatusBadge from './TicketStatusBadge.vue';
import TicketPriorityBadge from './TicketPriorityBadge.vue';
import EditTicketModal from './EditTicketModal.vue';

const props = defineProps<{ ticket: Ticket }>();
const emit = defineEmits<{
  updated: [ticket: Ticket];
  deleted: [];
}>();

const { showToast } = useToast();
const editModal = ref<InstanceType<typeof EditTicketModal> | null>(null);
const deleteDialog = ref<HTMLDialogElement | null>(null);
const retrying = ref(false);
const retryError = ref<string | null>(null);
const deleting = ref(false);

async function handleRetry() {
  retrying.value = true;
  retryError.value = null;
  try {
    const updated = await retryAiAnalysis(props.ticket.id);
    emit('updated', updated);
    showToast('AI analysis completed', 'success');
  } catch {
    retryError.value = 'AI analysis failed. Please try again later.';
  } finally {
    retrying.value = false;
  }
}

async function confirmDelete() {
  deleting.value = true;
  try {
    await deleteTicket(props.ticket.id);
    deleteDialog.value?.close();
    showToast('Ticket deleted', 'success');
    emit('deleted');
  } catch {
    showToast('Failed to delete ticket', 'error');
  } finally {
    deleting.value = false;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header card -->
    <div class="card bg-base-100 shadow-sm border border-base-300">
      <div class="card-body">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl font-bold text-base-content">{{ ticket.title }}</h1>
            <p class="mt-1 text-sm text-base-content/50">
              Created {{ formatDate(ticket.createdAt) }}
            </p>
          </div>
          <div class="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <TicketPriorityBadge :priority="ticket.priority" />
            <TicketStatusBadge :status="ticket.status" />
            <button class="btn btn-sm btn-outline" @click="editModal?.open()">
              Edit
            </button>
            <button class="btn btn-sm btn-error btn-outline" @click="deleteDialog?.showModal()">
              Delete
            </button>
          </div>
        </div>
        <div class="divider my-2"></div>
        <div>
          <h2 class="text-sm font-medium text-base-content/70 mb-1">Description</h2>
          <p class="whitespace-pre-wrap text-base-content/80">{{ ticket.description }}</p>
        </div>
      </div>
    </div>

    <!-- AI Analysis card -->
    <div
      v-if="ticket.aiSummary || ticket.aiCategory || ticket.aiSuggestedResponse"
      class="card bg-base-100 shadow-sm border border-base-300"
    >
      <div class="card-body">
        <h2 class="card-title text-base gap-2">
          <svg class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Analysis
        </h2>

        <div class="grid gap-4 sm:grid-cols-1 mt-2">
          <div v-if="ticket.aiSummary">
            <p class="text-xs font-medium text-base-content/50 uppercase tracking-wide mb-1">Summary</p>
            <p class="text-sm text-base-content">{{ ticket.aiSummary }}</p>
          </div>

          <div v-if="ticket.aiCategory">
            <p class="text-xs font-medium text-base-content/50 uppercase tracking-wide mb-1">Category</p>
            <span class="badge badge-primary">{{ ticket.aiCategory }}</span>
          </div>
        </div>

        <div v-if="ticket.aiSuggestedResponse" class="mt-3">
          <p class="text-xs font-medium text-base-content/50 uppercase tracking-wide mb-2">Suggested Response</p>
          <div class="rounded-lg bg-success/10 border border-success/20 p-4">
            <p class="whitespace-pre-wrap text-sm">{{ ticket.aiSuggestedResponse }}</p>
          </div>
        </div>

        <div v-if="ticket.aiTags.length" class="mt-3">
          <p class="text-xs font-medium text-base-content/50 uppercase tracking-wide mb-2">Tags</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in ticket.aiTags" :key="tag" class="badge badge-neutral">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- No AI Analysis fallback -->
    <div v-else role="alert" class="alert alert-warning">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div class="flex-1">
        <p class="text-sm">AI analysis is not available for this ticket.</p>
        <p v-if="retryError" class="text-sm text-error mt-1">{{ retryError }}</p>
      </div>
      <button @click="handleRetry" :disabled="retrying" class="btn btn-sm btn-warning">
        <span v-if="retrying" class="loading loading-spinner loading-xs"></span>
        {{ retrying ? 'Analyzing...' : 'Retry AI Analysis' }}
      </button>
    </div>

    <!-- Edit modal -->
    <EditTicketModal ref="editModal" :ticket="ticket" @updated="$emit('updated', $event)" />

    <!-- Delete confirmation modal -->
    <dialog ref="deleteDialog" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold">Delete Ticket</h3>
        <p class="py-4 text-base-content/70">
          Are you sure you want to delete <span class="font-medium text-base-content">"{{ ticket.title }}"</span>? This action cannot be undone.
        </p>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-ghost">Cancel</button>
          </form>
          <button class="btn btn-error" :disabled="deleting" @click="confirmDelete">
            <span v-if="deleting" class="loading loading-spinner loading-sm"></span>
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>
