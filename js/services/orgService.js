// Service: Organization
import { users, POSITION_LEVELS, WAREHOUSES } from "../data/orgData.js";

export { POSITION_LEVELS, WAREHOUSES };

export function getAllUsers() {
    return users;
}

export function getUserById(id) {
    return users.find(u => u.id === id);
}

export function getApprovers() {
    return users.filter(u => u.role === "approver");
}

export function setApprover(userId, approverId) {
    const user = getUserById(userId);
    if (user) user.approverId = approverId || null;
}

export function setPosition(userId, position) {
    const user = getUserById(userId);
    if (user) user.position = position;
}

export function setWarehouse(userId, warehouse) {
    const user = getUserById(userId);
    if (user) user.warehouse = warehouse;
}
