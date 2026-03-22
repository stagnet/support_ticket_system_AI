import { Prisma } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import {
  CreateTicketInput,
  TicketListQuery,
  UpdateTicketInput,
  AIAnalysisResult,
} from '../types/ticket.types';
import { AppError } from '../middleware/errorHandler';

export class TicketService {
  async create(input: CreateTicketInput, aiResult: AIAnalysisResult | null) {
    const data: Prisma.TicketCreateInput = {
      title: input.title,
      description: input.description,
      status: 'OPEN',
      priority: aiResult?.priority ?? 'MEDIUM',
      aiSummary: aiResult?.summary ?? null,
      aiCategory: aiResult?.category ?? null,
      aiSuggestedResponse: aiResult?.suggestedResponse ?? null,
      aiTags: aiResult?.tags ?? [],
    };

    const ticket = await prisma.ticket.create({ data });
    logger.info('Ticket created', {
      ticketId: ticket.id,
      hasAiAnalysis: !!aiResult,
    });
    return ticket;
  }

  async findAll(query: TicketListQuery) {
    const { status, priority, page = 1, limit = 10 } = query;

    const where: Prisma.TicketWhereInput = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ]);

    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new AppError(404, `Ticket with id '${id}' not found`);
    }
    return ticket;
  }

  async update(id: string, input: UpdateTicketInput) {
    await this.findById(id);
    const ticket = await prisma.ticket.update({
      where: { id },
      data: input,
    });
    logger.info('Ticket updated', { ticketId: id });
    return ticket;
  }

  async remove(id: string) {
    await this.findById(id);
    await prisma.ticket.delete({ where: { id } });
    logger.info('Ticket deleted', { ticketId: id });
  }

  async updateAiFields(id: string, aiResult: AIAnalysisResult) {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        priority: aiResult.priority,
        aiSummary: aiResult.summary,
        aiCategory: aiResult.category,
        aiSuggestedResponse: aiResult.suggestedResponse,
        aiTags: aiResult.tags,
      },
    });
    logger.info('AI analysis updated', { ticketId: id });
    return ticket;
  }
}

export const ticketService = new TicketService();
