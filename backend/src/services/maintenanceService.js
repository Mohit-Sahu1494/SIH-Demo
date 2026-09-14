import { MaintenanceRecord } from '../models/MaintenanceRecord.js';
import { Asset } from '../models/Asset.js';
import { Station } from '../models/Station.js';

let socketServerRef = null;

export const maintenanceService = {
  setSocketServer(io) {
    socketServerRef = io;
  },

  async getMaintenanceRecords(stationCode, status) {
    const filter = {};
    if (stationCode) filter.stationCode = stationCode.toUpperCase();
    if (status) filter.status = status.toUpperCase();

    return MaintenanceRecord.find(filter).sort({ scheduledAt: 1 }).lean();
  },

  async createWorkOrder(data) {
    const station = await Station.findOne({ code: data.stationCode.toUpperCase() }).lean();
    if (!station) throw new Error('Station not found');

    const record = await MaintenanceRecord.create({
      stationId: station._id,
      stationCode: data.stationCode.toUpperCase(),
      assetId: data.assetId.toUpperCase(),
      title: data.title,
      description: data.description,
      priority: data.priority || 'MEDIUM',
      status: data.status || 'SCHEDULED',
      scheduledAt: data.scheduledAt || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      assignedTo: data.assignedTo || 'Chief Engineer',
      notes: data.notes,
      isAutomatedRecommendation: !!data.isAutomatedRecommendation,
    });

    if (socketServerRef) {
      socketServerRef.emit('maintenance-update', record);
    }
    return record;
  },

  async updateStatus(id, status, notes) {
    const update = { status };
    if (status === 'COMPLETED') update.completedAt = new Date();
    if (notes) update.notes = notes;

    const record = await MaintenanceRecord.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (socketServerRef && record) {
      socketServerRef.emit('maintenance-update', record);
    }
    return record;
  },

  async getCriticalAssetsWithRecommendations(stationCode) {
    const assets = await Asset.find({
      stationCode: stationCode.toUpperCase(),
      status: { $in: ['WARNING', 'CRITICAL'] },
    }).lean();

    return assets.map((asset) => {
      let recommendation = 'Perform standard scheduled diagnostic check.';
      let priority = 'MEDIUM';

      if (asset.assetId === 'GEN-02' && asset.status === 'CRITICAL') {
        recommendation = 'Urgent: Disassemble cooling shroud, flush heat exchanger glycol, and check vibration damper mounts.';
        priority = 'CRITICAL';
      } else if (asset.status === 'CRITICAL') {
        recommendation = 'Critical status flagged: Isolate electrical feed and inspect component wear.';
        priority = 'HIGH';
      } else if (asset.status === 'WARNING') {
        recommendation = 'Warning threshold exceeded: Schedule preventive inspection within 48 hours.';
        priority = 'MEDIUM';
      }

      return {
        asset,
        recommendation,
        priority,
      };
    });
  },
};

export default maintenanceService;
