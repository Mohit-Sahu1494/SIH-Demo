import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema({
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  stationCode: {
    type: String,
    uppercase: true,
  },
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Fuel', 'Food', 'Medicine', 'Spare Parts', 'Scientific Supplies', 'Maintenance Materials'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  warningThreshold: {
    type: Number,
    required: true,
  },
  criticalThreshold: {
    type: Number,
    required: true,
  },
  daysRemaining: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['HEALTHY', 'WARNING', 'CRITICAL'],
    default: 'HEALTHY',
  },
  consumptionRatePerDay: {
    type: Number,
    default: 1,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

inventoryItemSchema.index({ stationId: 1, category: 1 });

export const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
export default InventoryItem;
