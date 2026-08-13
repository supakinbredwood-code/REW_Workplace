// Component: Profile Panel
import { getCurrentUser, logout } from "../services/authService.js";
import { getApprovers, getAllUsers, setApprover, setPosition, setWarehouse, POSITION_LEVELS, WAREHOUSES } from "../services/orgService.js";
import { getZone, setZone } from "../services/warehouseZoneService.js";
import { renderAvatar } from "../utils/avatar.js";

function renderOrgTable() {
    const container = document.getElementById("orgTableBody");
    if (!container) return;
    const approvers = getApprovers();

    container.innerHTML = getAllUsers().map(u => `
        <div class="org-row">
            <div class="org-row-header">
                <span class="org-row-name">${u.name}</span>
                ${u.isAdmin ? `<span class="org-row-admin-badge">Admin</span>` : ""}
            </div>
            <div class="org-row-fields">
                <label class="org-field">
                    <span class="org-field-label">Position</span>
                    <select class="org-row-select" data-field="position" data-user-id="${u.id}">
                        ${POSITION_LEVELS.map(p => `<option value="${p}" ${u.position === p ? "selected" : ""}>${p}</option>`).join("")}
                    </select>
                </label>
                <label class="org-field">
                    <span class="org-field-label">Warehouse</span>
                    <select class="org-row-select" data-field="warehouse" data-user-id="${u.id}">
                        ${WAREHOUSES.map(w => `<option value="${w}" ${u.warehouse === w ? "selected" : ""}>${w}</option>`).join("")}
                    </select>
                </label>
                <label class="org-field org-field-full">
                    <span class="org-field-label">Approver</span>
                    <select class="org-row-select" data-field="approver" data-user-id="${u.id}">
                        <option value="">— None —</option>
                        ${approvers.filter(a => a.id !== u.id).map(a => `<option value="${a.id}" ${u.approverId === a.id ? "selected" : ""}>${a.name}</option>`).join("")}
                    </select>
                </label>
            </div>
        </div>
    `).join("");

    container.querySelectorAll(".org-row-select").forEach(select => {
        select.addEventListener("change", () => {
            const userId = select.getAttribute("data-user-id");
            const field = select.getAttribute("data-field");
            if (field === "position") setPosition(userId, select.value);
            else if (field === "warehouse") setWarehouse(userId, select.value);
            else if (field === "approver") setApprover(userId, select.value);

            const current = getCurrentUser();
            if (current && userId === current.id) renderProfile();
        });
    });
}

function renderZoneTable() {
    const container = document.getElementById("zoneTableBody");
    if (!container) return;

    container.innerHTML = WAREHOUSES.map(code => {
        const zone = getZone(code) || { lat: "", lng: "", radiusMeters: "" };
        return `
        <div class="org-row" data-warehouse-row="${code}">
            <div class="org-row-header">
                <span class="org-row-name">${code}</span>
            </div>
            <div class="org-row-fields">
                <label class="org-field">
                    <span class="org-field-label">Latitude</span>
                    <input type="number" step="0.000001" class="org-row-input" data-field="lat" value="${zone.lat}">
                </label>
                <label class="org-field">
                    <span class="org-field-label">Longitude</span>
                    <input type="number" step="0.000001" class="org-row-input" data-field="lng" value="${zone.lng}">
                </label>
                <label class="org-field org-field-full">
                    <span class="org-field-label">Radius (meters)</span>
                    <input type="number" step="1" min="10" class="org-row-input" data-field="radiusMeters" value="${zone.radiusMeters}">
                </label>
            </div>
        </div>`;
    }).join("");

    container.querySelectorAll(".org-row-input").forEach(input => {
        input.addEventListener("change", () => {
            const row = input.closest("[data-warehouse-row]");
            const code = row.getAttribute("data-warehouse-row");
            const lat = parseFloat(row.querySelector('[data-field="lat"]').value);
            const lng = parseFloat(row.querySelector('[data-field="lng"]').value);
            const radiusMeters = parseFloat(row.querySelector('[data-field="radiusMeters"]').value);
            if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radiusMeters)) return;
            setZone(code, { lat, lng, radiusMeters });
        });
    });
}

function renderInfoList(user) {
    const list = document.getElementById("profileInfoList");
    if (!list) return;
    const rows = [
        ["Email", user.email || "—"],
        ["Phone", user.phone || "—"],
        ["Address", user.address || "—"]
    ];
    list.innerHTML = rows.map(([label, value]) => `
        <div class="profile-info-row">
            <span class="profile-info-label">${label}</span>
            <span class="profile-info-value">${value}</span>
        </div>
    `).join("");
}

function renderProfile() {
    const user = getCurrentUser();
    if (!user) return;
    renderAvatar(document.getElementById("profileAvatar"), user);
    document.getElementById("profileName").textContent = user.name;
    document.getElementById("profileRole").textContent = `${user.position} · ${user.warehouse}`;
    document.getElementById("profileAccountType").textContent = user.isAdmin ? "Admin" : (user.role === "approver" ? "Approver" : "Employee");
    document.getElementById("profileUsername").textContent = `@${user.username}`;
    renderInfoList(user);

    document.getElementById("profileAdminBtn").hidden = !user.isAdmin;
}

function showProfileScreen(screenId) {
    document.querySelectorAll(".profile-screen").forEach(s => s.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");
}

function openEditScreen() {
    const user = getCurrentUser();
    if (!user) return;
    document.getElementById("profileEditName").value = user.name;
    document.getElementById("profileEditEmail").value = user.email || "";
    document.getElementById("profileEditPhone").value = user.phone || "";
    document.getElementById("profileEditAddress").value = user.address || "";
    renderAvatar(document.getElementById("profileEditAvatarPreview"), user);
    showProfileScreen("profileEditScreen");
}

function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        const user = getCurrentUser();
        if (!user) return;
        user.photo = reader.result;
        renderAvatar(document.getElementById("profileEditAvatarPreview"), user);
    };
    reader.readAsDataURL(file);
}

function openAdminScreen() {
    const user = getCurrentUser();
    if (!user || !user.isAdmin) return;
    renderOrgTable();
    renderZoneTable();
    showProfileScreen("profileAdminScreen");
}

function handleEditSubmit(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;
    user.name = document.getElementById("profileEditName").value.trim() || user.name;
    user.email = document.getElementById("profileEditEmail").value.trim();
    user.phone = document.getElementById("profileEditPhone").value.trim();
    user.address = document.getElementById("profileEditAddress").value.trim();
    renderProfile();
    showProfileScreen("profileViewScreen");
}

export function initProfilePanel(onLogout) {
    const logoutBtn = document.getElementById("profileLogoutBtn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {
        logout();
        onLogout();
    });

    document.getElementById("profileEditBtn").addEventListener("click", openEditScreen);
    document.getElementById("profileEditBackBtn").addEventListener("click", () => showProfileScreen("profileViewScreen"));
    document.getElementById("profilePhotoInput").addEventListener("change", handlePhotoChange);
    document.getElementById("profileEditForm").addEventListener("submit", handleEditSubmit);

    document.getElementById("profileAdminBtn").addEventListener("click", openAdminScreen);
    document.getElementById("profileAdminBackBtn").addEventListener("click", () => showProfileScreen("profileViewScreen"));
}

export function refreshProfilePanel() {
    showProfileScreen("profileViewScreen");
    renderProfile();
}
