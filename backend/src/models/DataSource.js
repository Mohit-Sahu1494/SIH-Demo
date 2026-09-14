import mongoose from 'mongoose';

const dataSourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['NCPOR', 'WEATHER_MODEL', 'SIMULATOR', 'EXTERNAL_OBSERVATION', 'REFERENCE'],
      required: true,
    },
    baseUrl: {
      type: String,
      trim: true,
    },
    station: {
      type: String, // 'BHT', 'MTR', or 'ALL'
      default: 'ALL',
    },
    lastSync: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'DEGRADED', 'OFFLINE', 'SYNCHRONIZING'],
      default: 'ACTIVE',
    },
    description: {
      type: String,
    },
    reliabilityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 98,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

dataSourceSchema.index({ code: 1 });
dataSourceSchema.index({ type: 1 });

export const DataSource = mongoose.model('DataSource', dataSourceSchema);
export default DataSource;
