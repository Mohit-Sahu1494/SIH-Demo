import { Station } from '../models/Station.js';

export const stationRepository = {
  async findAll() {
    return Station.find().sort({ name: 1 }).lean();
  },

  async findById(id) {
    return Station.findById(id).lean();
  },

  async findByCode(code) {
    return Station.findOne({ code: code.toUpperCase() }).lean();
  },

  async updateHealth(code, healthScore, healthBreakdown) {
    return Station.findOneAndUpdate(
      { code: code.toUpperCase() },
      {
        $set: {
          healthScore,
          healthBreakdown,
          status: healthScore < 50 ? 'CRITICAL' : healthScore < 80 ? 'WARNING' : 'OPERATIONAL',
        },
      },
      { new: true }
    ).lean();
  },

  async updateStatus(code, status) {
    return Station.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $set: { status } },
      { new: true }
    ).lean();
  },
};

export default stationRepository;
