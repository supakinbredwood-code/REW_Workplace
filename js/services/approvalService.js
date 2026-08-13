// Service: Approval
import { approvalRequests, documentTypes } from "../data/approvalData.js";
import { getUserById } from "./orgService.js";

export function getTypeLabel(typeKey) {
    const type = documentTypes.find(t => t.key === typeKey);
    return type ? type.label : typeKey;
}

export function getRequesterName(request) {
    const user = getUserById(request.requesterId);
    return user ? user.name : "Unknown";
}

export function getApproverName(request) {
    const user = getUserById(request.approverId);
    return user ? user.name : "Unassigned";
}

export function filterByStatus(requests, status) {
    if (status === "all") return requests;
    return requests.filter(r => r.status === status);
}

export function getRequestsForApprover(approverId) {
    return approvalRequests.filter(r => r.approverId === approverId);
}

export function getRequestsByRequester(requesterId) {
    return approvalRequests.filter(r => r.requesterId === requesterId);
}

export function updateStatus(requestId, newStatus) {
    const request = approvalRequests.find(r => r.id === requestId);
    if (request) request.status = newStatus;
}

let requestSeq = approvalRequests.length;
export function createRequest({ typeKey, requesterId, approverId, details }) {
    requestSeq += 1;
    const request = {
        id: `AP-${1000 + requestSeq}`,
        typeKey,
        requesterId,
        approverId,
        dateRequested: new Date().toISOString().slice(0, 10),
        status: "pending",
        details
    };
    approvalRequests.push(request);
    return request;
}
