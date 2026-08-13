// Service: Clock In
import { distanceMeters } from "../utils/geo.js";
import { getCurrentUser } from "./authService.js";
import { getZone } from "./warehouseZoneService.js";

const statesByUser = {};

function getUserState() {
    const user = getCurrentUser();
    if (!user) return null;
    if (!statesByUser[user.id]) {
        statesByUser[user.id] = { status: "not-clocked-in", clockInAt: null, clockOutAt: null, history: [] };
    }
    return statesByUser[user.id];
}

export function getState() {
    return getUserState() || { status: "not-clocked-in", clockInAt: null, clockOutAt: null, history: [] };
}

export function clockIn() {
    const state = getUserState();
    if (!state) return;
    const now = new Date();
    state.status = "working";
    state.clockInAt = now;
    state.clockOutAt = null;
    state.history.push({ type: "in", time: now });
}

export function clockOut() {
    const state = getUserState();
    if (!state) return;
    const now = new Date();
    state.status = "clocked-out";
    state.clockOutAt = now;
    state.history.push({ type: "out", time: now });
}

export function checkZone(lat, lng) {
    const user = getCurrentUser();
    const zone = user ? getZone(user.warehouse) : null;
    if (!zone) return { withinZone: false, distance: null, zone: null };

    const distance = distanceMeters(lat, lng, zone.lat, zone.lng);
    return { withinZone: distance <= zone.radiusMeters, distance, zone };
}

export function getElapsedMs() {
    const state = getUserState();
    if (!state) return 0;
    if (state.status === "working" && state.clockInAt) return Date.now() - state.clockInAt.getTime();
    if (state.status === "clocked-out" && state.clockInAt && state.clockOutAt) return state.clockOutAt.getTime() - state.clockInAt.getTime();
    return 0;
}
