<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTicket } from '../composables/useTicket';
import type { Ticket } from '../types/ticket';
import TicketDetail from '../components/TicketDetail.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import ErrorAlert from '../components/ErrorAlert.vue';

const route = useRoute();
const router = useRouter();
const { ticket, loading, error, fetchTicket } = useTicket();

function onUpdated(updated: Ticket) {
  ticket.value = updated;
}

function onDeleted() {
  router.push({ name: 'home' });
}

onMounted(() => {
  fetchTicket(route.params.id as string);
});
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <div class="mb-5">
      <router-link :to="{ name: 'home' }" class="btn btn-ghost btn-sm gap-1">
        &larr; Back to tickets
      </router-link>
    </div>

    <LoadingSpinner v-if="loading" message="Loading ticket..." />

    <ErrorAlert
      v-else-if="error"
      :message="error"
      :retryable="true"
      @retry="fetchTicket(route.params.id as string)"
    />

    <TicketDetail
      v-else-if="ticket"
      :ticket="ticket"
      @updated="onUpdated"
      @deleted="onDeleted"
    />
  </div>
</template>
