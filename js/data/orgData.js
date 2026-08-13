// Data: Organization
export const POSITION_LEVELS = ["Manager", "Assistant Manager", "Supervisor", "Assistant Supervisor", "Leader", "Ops"];

export const WAREHOUSES = ["599-3", "599-4", "599-5", "WH-92", "WH-93", "WH-97", "WH-A1", "WH-KK"];

export const users = [
    { id: "u1", name: "Aran Kittisak", username: "aran", password: "1234", role: "employee", isAdmin: false, position: "Supervisor", warehouse: "599-4", approverId: "u3" },
    { id: "u2", name: "Suda Malee", username: "suda", password: "1234", role: "employee", isAdmin: false, position: "Ops", warehouse: "599-4", approverId: "u3" },
    { id: "u3", name: "Kittipong Charoen", username: "kittipong", password: "1234", role: "approver", isAdmin: true, position: "Manager", warehouse: "599-3", approverId: null },
    { id: "u4", name: "Niran Boonmee", username: "niran", password: "1234", role: "employee", isAdmin: false, position: "Leader", warehouse: "WH-A1", approverId: "u5" },
    { id: "u5", name: "Siriporn Wongsa", username: "siriporn", password: "1234", role: "approver", isAdmin: false, position: "Manager", warehouse: "WH-A1", approverId: null },
    { id: "u6", name: "Pranee Suksawat", username: "pranee", password: "1234", role: "employee", isAdmin: false, position: "Ops", warehouse: "599-3", approverId: "u3" },
    { id: "u7", name: "Somchai Wattana", username: "somchai", password: "1234", role: "employee", isAdmin: false, position: "Assistant Supervisor", warehouse: "WH-A1", approverId: "u5" },
    { id: "u8", name: "Anan Phongsathorn", username: "anan", password: "1234", role: "approver", isAdmin: false, position: "Manager", warehouse: "WH-KK", approverId: "u3" }
];
