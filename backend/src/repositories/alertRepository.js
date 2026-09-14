import { Alert } from '../models/Alert.js';

export const alertRepository = {
  async findActiveByDeduplicationKey(deduplicationKey) {
    return Alert.findOne({
      deduplicationKey,
      status: { $in: ['ACTIVE', 'ACKNOWLEDGED'] },
    }).lean();
  },

  async create(alertData) {
    return Alert.create(alertData);
  },

  async updateActive(id, updateData) {
    return Alert.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).lean();
  },

  async resolveByDeduplicationKey(deduplicationKey, reason = 'Parameter restored to nominal safe threshold') {
    return Alert.findOneAndUpdate(
      { deduplicationKey, status: { $in: ['ACTIVE', 'ACKNOWLEDGED'] } },
      {
        $set: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          resolvedBy: 'system-auto-recovery',
          description: `${reason}`,
        },
      },
      { new: true }
    ).lean();
  },

  async getAlerts(query = {}) {
    const filter = {};
    if (query.stationCode) filter.stationCode = query.stationCode.toUpperCase();
    if (query.status) filter.status = query.status.toUpperCase();
    if (query.severity) filter.severity = query.severity.toUpperCase();
    if (query.assetId) filter.assetId = query.assetId.toUpperCase();

    return Alert.find(filter).sort({ createdAt: -1 }).limit(query.limit || 100).lean();
  },

  async acknowledge(id, operatorName = 'Operator') {
    return Alert.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'ACKNOWLEDGED',
          acknowledgedAt: new Date(),
          acknowledgedBy: operatorName,
        },
      },
      { new: true }
    ).lean();
  },

  async resolve(id, operatorName = 'Operator') {
    return Alert.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          resolvedBy: operatorName,
        },
      },
      { new: true }
    ).lean();
  },

  async countActive(stationCode) {
    const filter = { status: { $in: ['ACTIVE', 'ACKNOWLEDGED'] } };
    if (stationCode) filter.stationCode = stationCode.toUpperCase();
    return Alert.countDocuments(filter);
  },
};

export default alertRepository;
