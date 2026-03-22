import { ref } from 'vue';
import { getTicket } from '../api/tickets';
import type { Ticket } from '../types/ticket';

export function useTicket() {
  const ticket = ref<Ticket | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchTicket(id: string) {
    loading.value = true;
    error.value = null;
    try {
      ticket.value = await getTicket(id);
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load ticket';
    } finally {
      loading.value = false;
    }
  }

  return { ticket, loading, error, fetchTicket };
}
