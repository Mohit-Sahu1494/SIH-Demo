import { z } from 'zod';

export const telemetryPayloadSchema = z.object({
  stationCode: z.string().min(2),
  assetId: z.string().min(2),
  telemetry: z.record(z.any()),
  sourceType: z.enum(['ACTUAL', 'REFERENCE', 'SIMULATED', 'EXTERNAL']).optional(),
});
