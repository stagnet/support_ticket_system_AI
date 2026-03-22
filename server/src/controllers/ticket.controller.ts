import { Request, Response, NextFunction } from 'express';
import { ticketService } from '../services/ticket.service';
import { aiService } from '../services/ai.service';
import { logger } from '../lib/logger';

export class TicketController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { title, description } = req.body;

      // Run AI analysis (returns null on failure — ticket still created)
      const aiResult = await aiService.analyzeTicket(title, description);

      if (!aiResult) {
        logger.warn('Ticket created without AI analysis', { title });
      }

      const ticket = await ticketService.create(
        { title, description },
        aiResult,
      );

      res.status(201).json({
        status: 'success',
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { status, priority, page, limit } = req.query;

      const result = await ticketService.findAll({
        status: status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | undefined,
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      res.json({
        status: 'success',
        data: result.tickets,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const ticket = await ticketService.findById(req.params.id as string);

      res.json({
        status: 'success',
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }
  async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const ticket = await ticketService.update(req.params.id as string, req.body);
      res.json({ status: 'success', data: ticket });
    } catch (error) {
      next(error);
    }
  }

  async remove(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await ticketService.remove(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async retryAi(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const ticket = await ticketService.findById(req.params.id as string);

      const aiResult = await aiService.analyzeTicket(
        ticket.title,
        ticket.description,
      );

      if (!aiResult) {
        res.status(502).json({
          status: 'error',
          message: 'AI analysis failed. Please try again later.',
        });
        return;
      }

      const updated = await ticketService.updateAiFields(ticket.id, aiResult);

      res.json({
        status: 'success',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const ticketController = new TicketController();
