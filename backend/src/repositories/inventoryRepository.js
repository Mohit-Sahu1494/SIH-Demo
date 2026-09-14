import { InventoryItem } from '../models/InventoryItem.js';

export const inventoryRepository = {
  async findByStationCode(stationCode, query = {}) {
    const filter = { stationCode: stationCode.toUpperCase() };
    if (query.category) filter.category = query.category;
    if (query.status) filter.status = query.status.toUpperCase();
    return InventoryItem.find(filter).sort({ category: 1, itemName: 1 }).lean();
  },

  async findById(id) {
    return InventoryItem.findById(id).lean();
  },

  async updateQuantity(id, quantity, daysRemaining, status) {
    const update = {
      quantity,
      lastUpdated: new Date(),
    };
    if (typeof daysRemaining === 'number') update.daysRemaining = daysRemaining;
    if (status) update.status = status;

    return InventoryItem.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  },

  async getSummary(stationCode) {
    const items = await InventoryItem.find({ stationCode: stationCode.toUpperCase() }).lean();
    const criticalCount = items.filter((i) => i.status === 'CRITICAL').length;
    const warningCount = items.filter((i) => i.status === 'WARNING').length;
    const healthyCount = items.filter((i) => i.status === 'HEALTHY').length;

    // Fuel item specific check
    const fuelItem = items.find((i) => i.itemName.toLowerCase().includes('fuel') || i.category === 'Fuel');

    return {
      totalItems: items.length,
      healthyCount,
      warningCount,
      criticalCount,
      fuelLevelPercent: fuelItem ? fuelItem.quantity : 78,
      fuelDaysRemaining: fuelItem ? fuelItem.daysRemaining : 45,
    };
  },
};

export default inventoryRepository;
