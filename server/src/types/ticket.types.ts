import { TicketStatus, TicketPriority } from '../generated/prisma/client';

export interface CreateTicketInput {
  title: string;
  description: string;
}

export interface TicketListQuery {
  status?: TicketStatus;
  priority?: TicketPriority;
  page?: number;
  limit?: number;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  status?: TicketStatus;
}

export interface AIAnalysisResult {
  summary: string;
  category: string;
  suggestedResponse: string;
  tags: string[];
  priority: TicketPriority;
}
