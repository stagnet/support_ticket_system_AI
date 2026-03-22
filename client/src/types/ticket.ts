export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  aiSummary: string | null;
  aiCategory: string | null;
  aiSuggestedResponse: string | null;
  aiTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
}

export interface UpdateTicketPayload {
  title?: string;
  description?: string;
  status?: TicketStatus;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  pagination?: PaginationMeta;
}
