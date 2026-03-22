import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(255, 'Title must be at most 255 characters')
      .trim(),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .trim(),
  }),
});

export const ticketListQuerySchema = z.object({
  query: z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export const ticketIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Ticket ID is required'),
  }),
});

export const updateTicketSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Ticket ID is required'),
  }),
  body: z
    .object({
      title: z.string().min(3, 'Title must be at least 3 characters').max(255).trim().optional(),
      description: z.string().min(10, 'Description must be at least 10 characters').trim().optional(),
      status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});
