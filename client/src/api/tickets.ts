import axios from 'axios';
import type {
  Ticket,
  CreateTicketPayload,
  UpdateTicketPayload,
  ApiResponse,
  PaginationMeta,
} from '../types/ticket';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function createTicket(
  payload: CreateTicketPayload,
): Promise<Ticket> {
  const { data } = await api.post<ApiResponse<Ticket>>(
    '/tickets',
    payload,
  );
  return data.data;
}

export async function getTickets(params?: {
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}): Promise<{ tickets: Ticket[]; pagination: PaginationMeta }> {
  const { data } = await api.get<
    ApiResponse<Ticket[]> & { pagination: PaginationMeta }
  >('/tickets', { params });
  return { tickets: data.data, pagination: data.pagination! };
}

export async function getTicket(id: string): Promise<Ticket> {
  const { data } = await api.get<ApiResponse<Ticket>>(
    `/tickets/${id}`,
  );
  return data.data;
}

export async function updateTicket(id: string, payload: UpdateTicketPayload): Promise<Ticket> {
  const { data } = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}`, payload);
  return data.data;
}

export async function deleteTicket(id: string): Promise<void> {
  await api.delete(`/tickets/${id}`);
}

export async function retryAiAnalysis(id: string): Promise<Ticket> {
  const { data } = await api.post<ApiResponse<Ticket>>(
    `/tickets/${id}/retry-ai`,
  );
  return data.data;
}
