import { z } from 'zod'

export const editSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('crop'),
    parameters: z.object({
      left: z.number().int().min(0),
      top: z.number().int().min(0),
      width: z.number().int().min(1),
      height: z.number().int().min(1),
    }),
  }),
  z.object({
    action: z.literal('resize'),
    parameters: z.object({
      width: z.number().int().min(1).optional(),
      height: z.number().int().min(1).optional(),
    }),
  }),
  z.object({
    action: z.literal('rotate'),
    parameters: z.object({
      angle: z.number(),
    }),
  }),
  z.object({
    action: z.literal('flip'),
    parameters: z.object({
      direction: z.enum(['horizontal', 'vertical']),
    }),
  }),
  z.object({
    action: z.literal('blur'),
    parameters: z.object({
      sigma: z.number().min(0.3).max(1000),
    }),
  }),
  z.object({
    action: z.literal('sharpen'),
    parameters: z.object({
      sigma: z.number().min(0.000001).max(10).optional(),
    }),
  }),
])

export type EditInput = z.infer<typeof editSchema>
