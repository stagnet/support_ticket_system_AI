<script setup lang="ts">
import type { Ticket } from '../types/ticket';
import TicketStatusBadge from './TicketStatusBadge.vue';
import TicketPriorityBadge from './TicketPriorityBadge.vue';

defineProps<{ tickets: Ticket[] }>();

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <router-link
      v-for="ticket in tickets"
      :key="ticket.id"
      :to="{ name: 'ticket-detail', params: { id: ticket.id } }"
      class="card card-compact bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div class="card-body">
        <div class="flex items-start justify-between gap-2">
          <h2 class="card-title text-sm text-primary truncate">{{ ticket.title }}</h2>
          <div class="flex shrink-0 gap-2">
            <TicketPriorityBadge :priority="ticket.priority" />
            <TicketStatusBadge :status="ticket.status" />
          </div>
        </div>
        <p class="text-sm text-base-content/60 line-clamp-1">
          {{ ticket.aiSummary || ticket.description }}
        </p>
        <div class="flex items-center justify-between flex-wrap gap-2 mt-1">
          <div v-if="ticket.aiTags.length" class="flex flex-wrap gap-1">
            <span
              v-for="tag in ticket.aiTags"
              :key="tag"
              class="badge badge-neutral badge-sm"
            >
              {{ tag }}
            </span>
          </div>
          <p class="text-xs text-base-content/40 ml-auto">
            {{ formatDate(ticket.createdAt) }}
          </p>
        </div>
      </div>
    </router-link>
  </div>
</template>
