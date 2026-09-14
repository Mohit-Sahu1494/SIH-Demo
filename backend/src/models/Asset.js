import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  stationCode: {
    type: String,
    required: true,
    uppercase: true,
  },
  assetId: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Power', 'Buildings', 'Utilities', 'Equipment', 'Communication', 'Logistics'],
    required: true,
  },
  status: {
    type: String,
    enum: ['HEALTHY', 'WARNING', 'CRITICAL', 'OFFLINE'],
    default: 'HEALTHY',
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 95,
  },
  location: {
    building: { type: String },
    coordinates3D: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
  },
  specifications: {
    manufacturer: { type: String },
    model: { type: String },
    capacity: { type: String },
    installDate: { type: Date },
    fuelType: { type: String },
  },
  currentTelemetry: {
    temperature: { type: Number },
    vibration: { type: Number },
    load: { type: Number },
    oilPressure: { type: Number },
    fuelConsumption: { type: Number },
    rpm: { type: Number },
    lastUpdated: { type: Date, default: Date.now },
  },
  thresholds: {
    temperature: { warning: { type: Number, default: 85 }, critical: { type: Number, default: 92 } },
    vibration: { warning: { type: Number, default: 3.0 }, critical: { type: Number, default: 4.0 } },
    load: { warning: { type: Number, default: 85 }, critical: { type: Number, default: 95 } },
  },
  lastMaintenanceAt: {
    type: Date,
  },
  nextMaintenanceAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

assetSchema.index({ stationId: 1, assetId: 1 }, { unique: true });
assetSchema.index({ category: 1 });
assetSchema.index({ status: 1 });

export const Asset = mongoose.model('Asset', assetSchema);
export default Asset;
