import alertRepository from '../repositories/alertRepository.js';
import { Station } from '../models/Station.js';

let socketServerRef = null;

export const alertService = {
  setSocketServer(io) {
    socketServerRef = io;
  },

  async handleCondition({
    stationCode,
    assetId,
    severity,
    type,
    title,
    description,
    reason,
    recommendedAction,
    deduplicationKey,
    isNominal = false,
  }) {
    const code = stationCode.toUpperCase();
    const station = await Station.findOne({ code }).lean();
    if (!station) return null;

    if (isNominal) {
      // If nominal safe condition, resolve any existing active alert for this key
      const resolvedAlert = await alertRepository.resolveByDeduplicationKey(
        deduplicationKey,
        'Parameter restored to safe nominal operating band'
      );
      if (resolvedAlert && socketServerRef) {
        socketServerRef.emit('alert-updated', resolvedAlert);
      }
      return resolvedAlert;
    }

    // Check if an alert with this deduplicationKey is already ACTIVE or ACKNOWLEDGED
    const existing = await alertRepository.findActiveByDeduplicationKey(deduplicationKey);

    if (existing) {
      // Update existing alert timestamp, severity and current reading description
      const updated = await alertRepository.updateActive(existing._id, {
        severity,
        description,
        reason,
        recommendedAction,
      });

      if (socketServerRef) {
        socketServerRef.emit('alert-updated', updated);
      }
      return updated;
    }

    // Otherwise create a new alert
    const newAlert = await alertRepository.create({
      stationId: station._id,
      stationCode: code,
      assetId: assetId ? assetId.toUpperCase() : undefined,
      severity,
      type,
      title,
      description,
      reason,
      recommendedAction,
      deduplicationKey,
      status: 'ACTIVE',
    });

    if (socketServerRef) {
      socketServerRef.emit('new-alert', newAlert);
    }

    return newAlert;
  },

  async getAlerts(query) {
    return alertRepository.getAlerts(query);
  },

  async acknowledgeAlert(id, operatorName) {
    const updated = await alertRepository.acknowledge(id, operatorName);
    if (updated && socketServerRef) {
      socketServerRef.emit('alert-updated', updated);
    }
    return updated;
  },

  async resolveAlert(id, operatorName) {
    const updated = await alertRepository.resolve(id, operatorName);
    if (updated && socketServerRef) {
      socketServerRef.emit('alert-updated', updated);
    }
    return updated;
  },
};

export default alertService;
