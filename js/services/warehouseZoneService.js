// Service: Warehouse Zone
import { warehouseZones } from "../data/warehouseZoneData.js";

export function getZone(warehouseCode) {
    return warehouseZones[warehouseCode] || null;
}

export function setZone(warehouseCode, { lat, lng, radiusMeters }) {
    warehouseZones[warehouseCode] = { lat, lng, radiusMeters };
}
