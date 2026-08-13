// Component: Clock In Panel
import { getState, clockIn, clockOut, getElapsedMs, checkZone } from "../services/clockInService.js";
import { getCurrentUser } from "../services/authService.js";
import { formatTime, formatDateLong, formatDuration } from "../utils/format.js";
import { renderAvatar } from "../utils/avatar.js";

const STATUS_LABELS = {
    "not-clocked-in": "Not Clocked In",
    working: "Working",
    "clocked-out": "Clocked Out"
};

function renderUserInfo() {
    const user = getCurrentUser();
    if (!user) return;
    document.getElementById("clockinUserName").textContent = `Hello, ${user.name.split(" ")[0]}!`;
    document.getElementById("clockinUserRole").textContent = `${user.position} · ${user.warehouse}`;
    renderAvatar(document.getElementById("clockinUserAvatar"), user);
}

function renderHistory() {
    const list = document.getElementById("clockinHistoryList");
    if (!list) return;
    const { history } = getState();
    if (!history.length) {
        list.innerHTML = `<li class="clockin-history-empty">No records yet</li>`;
        return;
    }
    list.innerHTML = history.map(entry => `
        <li class="clockin-history-item">
            <span class="clockin-history-icon clockin-history-icon-${entry.type}"><i class="fas ${entry.type === "in" ? "fa-arrow-right-to-bracket" : "fa-arrow-right-from-bracket"}"></i></span>
            <span class="clockin-history-type">${entry.type === "in" ? "Clock In" : "Clock Out"}</span>
            <span class="clockin-history-time">${formatTime(entry.time)}</span>
        </li>
    `).join("");
}

function renderStatus() {
    const state = getState();
    const badge = document.getElementById("clockinStatusBadge");
    const btn = document.getElementById("clockinActionBtn");
    const hoursValue = document.getElementById("clockinHoursValue");

    badge.textContent = STATUS_LABELS[state.status];
    badge.className = `status-badge status-${state.status}`;

    if (state.status === "working") {
        btn.textContent = "Clock Out";
        btn.disabled = false;
    } else if (state.status === "clocked-out") {
        btn.textContent = "Clocked Out";
        btn.disabled = true;
    } else {
        btn.textContent = "Clock In";
        btn.disabled = false;
    }

    hoursValue.textContent = formatDuration(getElapsedMs());
}

function setLocationMessage(text, statusKey) {
    const el = document.getElementById("clockinLocationMsg");
    if (!el) return;
    el.textContent = text;
    el.className = `clockin-location clockin-location-${statusKey}`;
}

function tick() {
    const now = new Date();
    document.getElementById("clockinDate").textContent = formatDateLong(now);
    document.getElementById("clockinTime").textContent = formatTime(now);
    if (getState().status === "working") {
        document.getElementById("clockinHoursValue").textContent = formatDuration(getElapsedMs());
    }
}

export function initClockInPanel() {
    const btn = document.getElementById("clockinActionBtn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        if (!getCurrentUser()) return;

        if (!navigator.geolocation) {
            setLocationMessage("Geolocation is not supported on this device.", "error");
            return;
        }

        setLocationMessage("Checking location...", "checking");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { withinZone, distance, zone } = checkZone(position.coords.latitude, position.coords.longitude);
                if (!zone) {
                    setLocationMessage("No clock-in zone configured for your warehouse yet.", "error");
                    return;
                }
                if (!withinZone) {
                    setLocationMessage(`Outside the allowed area (${Math.round(distance)}m away).`, "error");
                    return;
                }

                setLocationMessage(`Within the allowed area (${Math.round(distance)}m from center).`, "ok");
                if (getState().status === "not-clocked-in") clockIn();
                else if (getState().status === "working") clockOut();
                renderStatus();
                renderHistory();
            },
            () => setLocationMessage("Location permission denied. Cannot clock in/out.", "error"),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });

    tick();
    renderStatus();
    renderHistory();
    setInterval(tick, 1000);
}

export function refreshClockInPanel() {
    renderUserInfo();
    renderStatus();
    renderHistory();
}
