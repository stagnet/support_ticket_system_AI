<script setup lang="ts">
import { onMounted } from 'vue';
import { useTickets } from '../composables/useTickets';
import TicketList from '../components/TicketList.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import ErrorAlert from '../components/ErrorAlert.vue';
import EmptyState from '../components/EmptyState.vue';

const { tickets, loading, error, fetchTickets } = useTickets();

onMounted(() => {
  fetchTickets();
});
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-base-content">Support Tickets</h1>
    </div>

    <LoadingSpinner v-if="loading" message="Loading tickets..." />

    <ErrorAlert
      v-else-if="error"
      :message="error"
      :retryable="true"
      @retry="fetchTickets()"
    />

    <EmptyState
      v-else-if="tickets.length === 0"
      title="No tickets yet"
      description="Create your first support ticket to get started."
    >
      <div class="mt-4">
        <router-link :to="{ name: 'create-ticket' }" class="btn btn-primary btn-sm">
          Create Ticket
        </router-link>
      </div>
    </EmptyState>

    <TicketList v-else :tickets="tickets" />
  </div>
</template>
