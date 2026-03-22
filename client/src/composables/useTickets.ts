import { ref } from 'vue';
import { getTickets } from '../api/tickets';
import type { Ticket, PaginationMeta } from '../types/ticket';

export function useTickets() {
  const tickets = ref<Ticket[]>([]);
  const pagination = ref<PaginationMeta | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchTickets(params?: {
    status?: string;
    priority?: string;
    page?: number;
  }) {
    loading.value = true;
    error.value = null;
    try {
      const result = await getTickets(params);
      tickets.value = result.tickets;
      pagination.value = result.pagination;
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load tickets';
    } finally {
      loading.value = false;
    }
  }

  return { tickets, pagination, loading, error, fetchTickets };
}
