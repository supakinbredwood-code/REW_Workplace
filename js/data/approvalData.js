// Data: Approval
export const documentTypes = [
    { key: "leave", label: "Leave" },
    { key: "overtime", label: "Overtime (OT)" },
    { key: "expense", label: "Expense Claim" },
    { key: "purchase", label: "Purchase Request" },
    { key: "requisition", label: "Item Requisition" }
];

export const approvalRequests = [
    { id: "AP-1001", typeKey: "leave", requesterId: "u2", approverId: "u3", dateRequested: "2026-07-01", status: "pending", details: "Annual leave request for 2 days (Jul 10-11) to attend a family event." },
    { id: "AP-1002", typeKey: "overtime", requesterId: "u4", approverId: "u8", dateRequested: "2026-06-28", status: "approved", details: "Overtime request for 3 hours on Jun 27 to complete month-end stock count." },
    { id: "AP-1003", typeKey: "expense", requesterId: "u6", approverId: "u3", dateRequested: "2026-06-25", status: "rejected", details: "Expense claim of 1,200 THB for client entertainment, missing receipt." },
    { id: "AP-1004", typeKey: "purchase", requesterId: "u7", approverId: "u5", dateRequested: "2026-06-30", status: "pending", details: "Purchase request for 10 pallet jacks for the 599-4 warehouse." },
    { id: "AP-1005", typeKey: "leave", requesterId: "u8", approverId: "u3", dateRequested: "2026-06-20", status: "approved", details: "Sick leave for 1 day (Jun 21)." },
    { id: "AP-1006", typeKey: "overtime", requesterId: "u1", approverId: "u3", dateRequested: "2026-07-02", status: "pending", details: "Overtime request for 2 hours on Jul 3 to support urgent outbound shipment." },
    { id: "AP-1007", typeKey: "requisition", requesterId: "u1", approverId: "u3", dateRequested: "2026-07-03", status: "pending", details: "Request 5 boxes of packing tape and 2 rolls of stretch wrap for the 599-4 outbound line." },
    { id: "AP-1008", typeKey: "requisition", requesterId: "u2", approverId: "u3", dateRequested: "2026-06-29", status: "approved", details: "Request 20 pcs of barcode labels for inventory recount." }
];
