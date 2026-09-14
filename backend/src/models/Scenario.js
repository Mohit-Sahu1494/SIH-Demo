import mongoose from 'mongoose';

const scenarioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  stationCode: {
    type: String,
    required: true,
    uppercase: true,
    default: 'BHT',
  },
  type: {
    type: String,
    enum: ['NORMAL', 'GENERATOR_FAILURE', 'LOW_FUEL', 'HIGH_ENERGY_CONSUMPTION', 'EXTREME_WEATHER', 'LOW_INVENTORY'],
    default: 'NORMAL',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  configuration: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  startedAt: {
    type: Date,
  },
  stoppedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export const Scenario = mongoose.model('Scenario', scenarioSchema);
export default Scenario;
