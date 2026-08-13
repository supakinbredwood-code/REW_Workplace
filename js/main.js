// Entry Point
import { restoreSession } from "./services/authService.js";
import { initNavigation } from "./components/navigation.js";
import { initClockInPanel, refreshClockInPanel } from "./components/clockInPanel.js";
import { initApprovalPanel, refreshApprovalPanel } from "./components/approvalPanel.js";
import { initChatPanel } from "./components/chatPanel.js";
import { initProfilePanel, refreshProfilePanel } from "./components/profilePanel.js";
import { initLoginScreen } from "./components/loginScreen.js";

function showApp() {
    document.getElementById("loginScreen").classList.remove("active");
    document.getElementById("appShell").classList.add("active");
}

function showLogin() {
    document.getElementById("appShell").classList.remove("active");
    document.getElementById("loginScreen").classList.add("active");
}

function onAuthReady() {
    refreshClockInPanel();
    refreshApprovalPanel();
    refreshProfilePanel();
    showApp();
}

document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initClockInPanel();
    initApprovalPanel();
    initChatPanel();
    initProfilePanel(showLogin);
    initLoginScreen(onAuthReady);

    if (restoreSession()) {
        onAuthReady();
    } else {
        showLogin();
    }
});
