<script setup lang="ts">
import type { TicketStatus } from '../types/ticket';

const props = defineProps<{ status: TicketStatus }>();

const statusConfig: Record<TicketStatus, { label: string; classes: string }> = {
  OPEN: { label: 'Open', classes: 'badge-info' },
  IN_PROGRESS: { label: 'In Progress', classes: 'badge-warning' },
  RESOLVED: { label: 'Resolved', classes: 'badge-success' },
};
</script>

<template>
  <span class="badge badge-sm font-medium" :class="statusConfig[props.status].classes">
    {{ statusConfig[props.status].label }}
  </span>
</template>
