import mongoose from 'mongoose';

const environmentReadingSchema = new mongoose.Schema({
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
  temperature: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
  },
  pressure: {
    type: Number,
    required: true,
  },
  windSpeed: {
    type: Number,
    required: true,
  },
  windDirection: {
    type: String,
    required: true,
    default: 'SE',
  },
  visibility: {
    type: Number,
    required: true,
    default: 18,
  },
  snow: {
    type: String,
    default: 'Light Flurries',
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

environmentReadingSchema.index({ stationId: 1, timestamp: -1 });

export const EnvironmentReading = mongoose.model('EnvironmentReading', environmentReadingSchema);
export default EnvironmentReading;
