// Service: Auth
import { users } from "../data/orgData.js";

const SESSION_KEY = "rewworkplace_session";
let currentUser = null;

export function login(username, password) {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return null;
    currentUser = user;
    localStorage.setItem(SESSION_KEY, user.id);
    return user;
}

export function logout() {
    currentUser = null;
    localStorage.removeItem(SESSION_KEY);
}

export function restoreSession() {
    const savedId = localStorage.getItem(SESSION_KEY);
    if (!savedId) return null;
    const user = users.find(u => u.id === savedId);
    if (user) currentUser = user;
    return currentUser;
}

export function getCurrentUser() {
    return currentUser;
}
