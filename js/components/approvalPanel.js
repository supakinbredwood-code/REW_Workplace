// Component: Approval Panel
import {
    getTypeLabel, getRequesterName, getApproverName, filterByStatus,
    getRequestsForApprover, getRequestsByRequester, updateStatus, createRequest
} from "../services/approvalService.js";
import { getCurrentUser } from "../services/authService.js";

let mode = "myRequests";
let statusFilter = "all";

const TYPE_ICONS = {
    leave: "fa-plane-departure",
    overtime: "fa-business-time",
    expense: "fa-receipt",
    purchase: "fa-cart-shopping",
    requisition: "fa-box-open"
};

function buildRow(request, showActions) {
    const icon = TYPE_ICONS[request.typeKey] || "fa-file-lines";
    return `
        <div class="approval-row" data-request-id="${request.id}">
            <div class="approval-row-main">
                <div class="approval-row-icon"><i class="fas ${icon}"></i></div>
                <div class="approval-row-info">
                    <span class="approval-row-type">${getTypeLabel(request.typeKey)}</span>
                    <span class="approval-row-subtitle">${getRequesterName(request)} → ${getApproverName(request)} · ${request.dateRequested}</span>
                </div>
                <span class="approval-status-badge approval-status-${request.status}">${request.status}</span>
            </div>
            <div class="approval-row-detail">
                <p>${request.details}</p>
                ${showActions && request.status === "pending" ? `
                    <div class="approval-row-actions">
                        <button class="approval-action-btn approval-approve-btn" data-action="approved">Approve</button>
                        <button class="approval-action-btn approval-reject-btn" data-action="rejected">Reject</button>
                    </div>
                ` : ""}
            </div>
        </div>
    `;
}

function renderList() {
    const list = document.getElementById("approvalList");
    if (!list) return;
    const user = getCurrentUser();
    if (!user) {
        list.innerHTML = "";
        return;
    }

    const baseRequests = mode === "toApprove" ? getRequestsForApprover(user.id) : getRequestsByRequester(user.id);
    const requests = filterByStatus(baseRequests, statusFilter);
    const showActions = mode === "toApprove";

    list.innerHTML = requests.length
        ? requests.map(r => buildRow(r, showActions)).join("")
        : `<div class="approval-empty">No requests</div>`;

    list.querySelectorAll(".approval-row").forEach(row => {
        row.addEventListener("click", () => row.classList.toggle("expanded"));
    });

    list.querySelectorAll(".approval-action-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const requestId = btn.closest(".approval-row").getAttribute("data-request-id");
            updateStatus(requestId, btn.getAttribute("data-action"));
            renderList();
        });
    });
}

function setMode(newMode) {
    mode = newMode;
    document.querySelectorAll(".approval-mode-btn").forEach(b => b.classList.toggle("active", b.getAttribute("data-mode") === newMode));
    renderList();
}

function showApprovalScreen(screenId) {
    document.querySelectorAll(".approval-screen").forEach(s => s.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");
}

function submitOtForm(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;
    const date = document.getElementById("otDate").value;
    const hours = document.getElementById("otHours").value;
    const reason = document.getElementById("otReason").value;
    createRequest({
        typeKey: "overtime",
        requesterId: user.id,
        approverId: user.approverId,
        details: `Overtime request for ${hours} hour(s) on ${date}. Reason: ${reason}`
    });
    e.target.reset();
    setMode("myRequests");
    showApprovalScreen("approvalListScreen");
}

function submitItemForm(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;
    const itemName = document.getElementById("itemName").value;
    const qty = document.getElementById("itemQty").value;
    const reason = document.getElementById("itemReason").value;
    createRequest({
        typeKey: "requisition",
        requesterId: user.id,
        approverId: user.approverId,
        details: `Request ${qty} x ${itemName}. Reason: ${reason}`
    });
    e.target.reset();
    setMode("myRequests");
    showApprovalScreen("approvalListScreen");
}

export function initApprovalPanel() {
    const tabs = document.querySelectorAll("#approvalTabs .approval-tab-link");
    const modeButtons = document.querySelectorAll(".approval-mode-btn");
    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            statusFilter = tab.getAttribute("data-status");
            renderList();
        });
    });

    modeButtons.forEach(btn => {
        btn.addEventListener("click", () => setMode(btn.getAttribute("data-mode")));
    });

    document.getElementById("approvalNewRequestBtn").addEventListener("click", () => showApprovalScreen("approvalChooserScreen"));
    document.getElementById("approvalChooserBackBtn").addEventListener("click", () => showApprovalScreen("approvalListScreen"));

    document.querySelectorAll(".approval-chooser-card").forEach(card => {
        card.addEventListener("click", () => {
            const type = card.getAttribute("data-request-type");
            showApprovalScreen(type === "overtime" ? "approvalOtFormScreen" : "approvalItemFormScreen");
        });
    });

    document.querySelectorAll("[data-back-to='chooser']").forEach(btn => {
        btn.addEventListener("click", () => showApprovalScreen("approvalChooserScreen"));
    });

    document.getElementById("otForm").addEventListener("submit", submitOtForm);
    document.getElementById("itemForm").addEventListener("submit", submitItemForm);

    renderList();
}

export function refreshApprovalPanel() {
    const user = getCurrentUser();
    const toApproveBtn = document.getElementById("toApproveModeBtn");
    if (toApproveBtn) toApproveBtn.hidden = !(user && user.role === "approver");

    mode = "myRequests";
    statusFilter = "all";
    document.querySelectorAll(".approval-mode-btn").forEach(b => b.classList.toggle("active", b.getAttribute("data-mode") === "myRequests"));
    document.querySelectorAll("#approvalTabs .approval-tab-link").forEach(t => t.classList.toggle("active", t.getAttribute("data-status") === "all"));
    showApprovalScreen("approvalListScreen");
    renderList();
}
