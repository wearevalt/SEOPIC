import { z } from 'zod';

export const analyzeSchema = z.object({
  imageBase64: z
    .string()
    .min(1, 'Image requise')
    .max(10 * 1024 * 1024, 'Image trop grande (max 10MB)'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp'], {
    message: 'Type de fichier non supporté',
  }),
  imageName: z.string().max(255).optional(),
  imageSize: z.number().int().positive().optional(),
});

export const ticketCreateSchema = z.object({
  title: z
    .string()
    .min(3, 'Titre trop court (min 3 caractères)')
    .max(200, 'Titre trop long (max 200 caractères)')
    .trim(),
  description: z
    .string()
    .min(10, 'Description trop courte (min 10 caractères)')
    .max(5000, 'Description trop longue (max 5000 caractères)')
    .trim(),
  client_name: z.string().max(100).trim().optional(),
  client_email: z
    .string()
    .email('Email invalide')
    .max(254, 'Email trop long')
    .trim(),
  priority: z.enum(['Basse', 'Moyenne', 'Haute']).default('Moyenne'),
});

export const ticketReplySchema = z.object({
  message: z
    .string()
    .min(1, 'Message requis')
    .max(5000, 'Message trop long (max 5000 caractères)')
    .trim(),
  author: z.string().max(100).trim().optional(),
});

export type AnalyzeInput = z.infer<typeof analyzeSchema>;
export type TicketCreateInput = z.infer<typeof ticketCreateSchema>;
export type TicketReplyInput = z.infer<typeof ticketReplySchema>;
