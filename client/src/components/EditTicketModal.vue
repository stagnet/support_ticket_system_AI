<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { Ticket, TicketStatus } from '../types/ticket';
import { updateTicket } from '../api/tickets';
import { useToast } from '../composables/useToast';

const props = defineProps<{ ticket: Ticket }>();
const emit = defineEmits<{ updated: [ticket: Ticket] }>();

const { showToast } = useToast();
const dialog = ref<HTMLDialogElement | null>(null);
const submitting = ref(false);
const error = ref<string | null>(null);

const form = reactive({
  title: '',
  description: '',
  status: 'OPEN' as TicketStatus,
});

function open() {
  form.title = props.ticket.title;
  form.description = props.ticket.description;
  form.status = props.ticket.status;
  error.value = null;
  dialog.value?.showModal();
}

function close() {
  dialog.value?.close();
}

defineExpose({ open });

async function handleSubmit() {
  if (submitting.value) return;
  submitting.value = true;
  error.value = null;
  try {
    const updated = await updateTicket(props.ticket.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
    });
    emit('updated', updated);
    showToast('Ticket updated successfully', 'success');
    close();
  } catch {
    error.value = 'Failed to update ticket. Please try again.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box w-11/12 max-w-2xl">
      <h3 class="text-lg font-bold mb-4">Edit Ticket</h3>

      <div v-if="error" role="alert" class="alert alert-error mb-4">
        <span class="text-sm">{{ error }}</span>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="form-control w-full">
          <label class="label" for="edit-title">
            <span class="label-text font-medium">Title</span>
          </label>
          <input
            id="edit-title"
            v-model="form.title"
            type="text"
            required
            minlength="3"
            class="input input-bordered w-full"
            placeholder="Brief summary of your issue"
          />
        </div>

        <div class="form-control w-full">
          <label class="label" for="edit-description">
            <span class="label-text font-medium">Description</span>
          </label>
          <textarea
            id="edit-description"
            v-model="form.description"
            rows="4"
            required
            minlength="10"
            class="textarea textarea-bordered w-full"
            placeholder="Describe your issue in detail..."
          />
        </div>

        <div class="form-control w-full">
          <label class="label" for="edit-status">
            <span class="label-text font-medium">Status</span>
          </label>
          <select id="edit-status" v-model="form.status" class="select select-bordered w-full">
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="close">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            <span v-if="submitting" class="loading loading-spinner loading-sm"></span>
            {{ submitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
    <!-- Click outside to close -->
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
