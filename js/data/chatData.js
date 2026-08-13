// Data: Chat
export const chatContacts = [
    { id: "c1", name: "Suda Malee", online: true, lastMessage: "Order for 599-4 is ready to ship", lastTime: "09:32", unread: 2 },
    { id: "c2", name: "Niran Boonmee", online: true, lastMessage: "Got it, thanks!", lastTime: "08:47", unread: 0 },
    { id: "c3", name: "Pranee Suksawat", online: false, lastMessage: "See you at the meeting", lastTime: "Yesterday", unread: 0 },
    { id: "c4", name: "Somchai Wattana", online: false, lastMessage: "Can you approve my leave request?", lastTime: "Yesterday", unread: 1 },
    { id: "c5", name: "Siriporn Wongsa", online: true, lastMessage: "Overtime confirmed for tomorrow", lastTime: "07:15", unread: 0 }
];

export const chatMessages = {
    c1: [
        { sender: "them", text: "Morning! The order for 599-4 is ready to ship.", time: "09:20" },
        { sender: "me", text: "Great, please send the tracking number once it's out.", time: "09:25" },
        { sender: "them", text: "Order for 599-4 is ready to ship", time: "09:32" }
    ],
    c2: [
        { sender: "them", text: "Got it, thanks!", time: "08:47" }
    ],
    c3: [
        { sender: "me", text: "Don't forget the 2pm meeting today.", time: "17:50" },
        { sender: "them", text: "See you at the meeting", time: "17:52" }
    ],
    c4: [
        { sender: "them", text: "Can you approve my leave request?", time: "16:10" }
    ],
    c5: [
        { sender: "them", text: "Overtime confirmed for tomorrow", time: "07:15" }
    ]
};
