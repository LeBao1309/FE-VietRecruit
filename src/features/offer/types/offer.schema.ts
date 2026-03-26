import { z } from 'zod';

export const OfferStatusSchema = z.enum(["DRAFT", "SENT", "ACCEPTED", "DECLINED"]);
export type OfferStatus = z.infer<typeof OfferStatusSchema>;

export const OfferSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  offerLetterUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  baseSalary: z.coerce.number().min(0.01, 'Base salary must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  note: z.string().optional(),
  status: OfferStatusSchema,
  createdAt: z.string(),
});

export type Offer = z.infer<typeof OfferSchema>;

export const CreateOfferSchema = z.object({
  baseSalary: z.coerce.number().min(0.01, 'Base salary must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  offerLetterUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  note: z.string().optional()
});

export type CreateOfferDTO = z.infer<typeof CreateOfferSchema>;

export const UpdateOfferStatusSchema = z.object({
  status: OfferStatusSchema,
  note: z.string().optional()
});

export type UpdateOfferStatusDTO = z.infer<typeof UpdateOfferStatusSchema>;
