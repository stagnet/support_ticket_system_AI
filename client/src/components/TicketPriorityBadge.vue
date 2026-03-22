<script setup lang="ts">
import type { TicketPriority } from '../types/ticket';

const props = defineProps<{ priority: TicketPriority }>();

const priorityConfig: Record<TicketPriority, { label: string; classes: string }> = {
  LOW: { label: 'Low', classes: 'badge-neutral' },
  MEDIUM: { label: 'Medium', classes: 'badge-info' },
  HIGH: { label: 'High', classes: 'badge-warning' },
  URGENT: { label: 'Urgent', classes: 'badge-error' },
};
</script>

<template>
  <span class="badge badge-sm font-medium" :class="priorityConfig[props.priority].classes">
    {{ priorityConfig[props.priority].label }}
  </span>
</template>
