import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema({
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
    required: true,
    uppercase: true,
  },
  parameter: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  sourceType: {
    type: String,
    enum: ['ACTUAL', 'REFERENCE', 'SIMULATED', 'EXTERNAL'],
    default: 'SIMULATED',
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: false,
});

telemetrySchema.index({ stationId: 1, timestamp: -1 });
telemetrySchema.index({ assetId: 1, timestamp: -1 });
telemetrySchema.index({ parameter: 1, timestamp: -1 });
telemetrySchema.index({ stationId: 1, parameter: 1, timestamp: -1 });

export const Telemetry = mongoose.model('Telemetry', telemetrySchema);
export default Telemetry;
