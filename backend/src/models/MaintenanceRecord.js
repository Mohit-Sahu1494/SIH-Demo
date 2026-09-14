import mongoose from 'mongoose';

const maintenanceRecordSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'],
    default: 'SCHEDULED',
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  completedAt: {
    type: Date,
  },
  assignedTo: {
    type: String,
    default: 'Chief Engineer',
  },
  notes: {
    type: String,
  },
  isAutomatedRecommendation: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

maintenanceRecordSchema.index({ stationId: 1, status: 1 });
maintenanceRecordSchema.index({ assetId: 1, scheduledAt: -1 });

export const MaintenanceRecord = mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
export default MaintenanceRecord;
