import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  stationCode: {
    type: String,
    uppercase: true,
  },
  assetId: {
    type: String,
    trim: true,
    uppercase: true,
  },
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL'],
    default: 'INFO',
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  recommendedAction: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'],
    default: 'ACTIVE',
    required: true,
  },
  deduplicationKey: {
    type: String,
    index: true,
  },
  acknowledgedAt: {
    type: Date,
  },
  acknowledgedBy: {
    type: String,
  },
  resolvedAt: {
    type: Date,
  },
  resolvedBy: {
    type: String,
  },
}, {
  timestamps: true,
});

alertSchema.index({ stationId: 1, status: 1 });
alertSchema.index({ severity: 1, status: 1 });
alertSchema.index({ deduplicationKey: 1, status: 1 });

export const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
