import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    region: { type: String, default: 'Antarctica' },
    elevationMeters: { type: Number, default: 40 },
  },
  description: {
    type: String,
  },
  commissionedYear: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['OPERATIONAL', 'WARNING', 'CRITICAL', 'MAINTENANCE'],
    default: 'OPERATIONAL',
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 91,
  },
  healthBreakdown: {
    environment: { type: Number, default: 94 },
    energy: { type: Number, default: 87 },
    infrastructure: { type: Number, default: 91 },
    logistics: { type: Number, default: 92 },
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

stationSchema.index({ code: 1 });

export const Station = mongoose.model('Station', stationSchema);
export default Station;
