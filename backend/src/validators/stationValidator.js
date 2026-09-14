import { z } from 'zod';

export const stationSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(10),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    region: z.string().optional(),
    elevationMeters: z.number().optional(),
  }),
  description: z.string().optional(),
});
