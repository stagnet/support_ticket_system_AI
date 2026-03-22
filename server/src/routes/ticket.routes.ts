import { Router } from 'express';
import { ticketController } from '../controllers/ticket.controller';
import { validateRequest } from '../middleware/validateRequest';
import { createTicketLimiter } from '../middleware/rateLimiter';
import {
  createTicketSchema,
  ticketListQuerySchema,
  ticketIdParamSchema,
  updateTicketSchema,
} from '../validators/ticket.validator';

const router = Router();

router.post(
  '/',
  createTicketLimiter,
  validateRequest(createTicketSchema),
  ticketController.create.bind(ticketController),
);

router.get(
  '/',
  validateRequest(ticketListQuerySchema),
  ticketController.findAll.bind(ticketController),
);

router.get(
  '/:id',
  validateRequest(ticketIdParamSchema),
  ticketController.findById.bind(ticketController),
);

router.patch(
  '/:id',
  validateRequest(updateTicketSchema),
  ticketController.update.bind(ticketController),
);

router.delete(
  '/:id',
  validateRequest(ticketIdParamSchema),
  ticketController.remove.bind(ticketController),
);

router.post(
  '/:id/retry-ai',
  validateRequest(ticketIdParamSchema),
  ticketController.retryAi.bind(ticketController),
);

export default router;
