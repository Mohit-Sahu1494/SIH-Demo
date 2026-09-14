import mongoose from 'mongoose';

const healthSnapshotSchema = new mongoose.Schema({
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  stationCode: {
    type: String,
    uppercase: true,
  },
  overallHealth: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  environmentHealth: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  energyHealth: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  infrastructureHealth: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  logisticsHealth: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
}, {
  timestamps: false,
});

healthSnapshotSchema.index({ stationId: 1, timestamp: -1 });

export const HealthSnapshot = mongoose.model('HealthSnapshot', healthSnapshotSchema);
export default HealthSnapshot;
