import mongoose from 'mongoose';

const energyReadingSchema = new mongoose.Schema({
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: false,
  },
  stationCode: {
    type: String,
    uppercase: true,
    required: true,
  },
  generation: {
    type: Number, // kW
    required: true,
  },
  consumption: {
    type: Number, // kW
    required: true,
  },
  batteryLevel: {
    type: Number, // %
    required: true,
  },
  fuelLevel: {
    type: Number, // %
    required: true,
  },
  generatorLoad: {
    type: Number, // %
    required: true,
  },
  peakLoad: {
    type: Number, // kW
    default: 180,
  },
  efficiency: {
    type: Number, // %
    default: 89,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  sourceType: {
    type: String,
    enum: ['ACTUAL', 'REFERENCE', 'SIMULATED', 'EXTERNAL', 'WEATHER MODEL', 'NCPOR', 'REFERENCE DATA'],
    default: 'SIMULATED',
    required: true,
  },
}, {
  timestamps: false,
});

energyReadingSchema.index({ stationId: 1, timestamp: -1 });

export const EnergyReading = mongoose.model('EnergyReading', energyReadingSchema);
export default EnergyReading;
