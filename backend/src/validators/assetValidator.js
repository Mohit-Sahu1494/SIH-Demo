import { z } from 'zod';

export const assetSchema = z.object({
  stationCode: z.string().min(2),
  assetId: z.string().min(2),
  name: z.string().min(2),
  type: z.string().min(2),
  category: z.enum(['Power', 'Buildings', 'Utilities', 'Equipment', 'Communication', 'Logistics']),
  location: z.object({
    building: z.string().optional(),
  }).optional(),
});
