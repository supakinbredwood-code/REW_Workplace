// Service: Chat
import { chatContacts, chatMessages } from "../data/chatData.js";

export function searchContacts(term) {
    const q = term.trim().toLowerCase();
    if (!q) return chatContacts;
    return chatContacts.filter(c => c.name.toLowerCase().includes(q));
}

export function getContact(chatId) {
    return chatContacts.find(c => c.id === chatId);
}

export function getMessages(chatId) {
    return chatMessages[chatId] || [];
}

export function sendMessage(chatId, text) {
    const now = new Date();
    const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    if (!chatMessages[chatId]) chatMessages[chatId] = [];
    chatMessages[chatId].push({ sender: "me", text, time });

    const contact = getContact(chatId);
    if (contact) {
        contact.lastMessage = text;
        contact.lastTime = time;
    }
}
