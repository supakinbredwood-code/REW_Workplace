// Component: Chat Panel
import { searchContacts, getContact, getMessages, sendMessage } from "../services/chatService.js";

let activeChatId = null;

function renderContactList(term = "") {
    const list = document.getElementById("chatContactList");
    if (!list) return;
    const contacts = searchContacts(term);

    list.innerHTML = contacts.map(c => `
        <li class="chat-contact-item ${c.id === activeChatId ? "active" : ""}" data-chat-id="${c.id}">
            <div class="chat-contact-avatar">
                ${c.name.charAt(0)}
                <span class="chat-online-dot ${c.online ? "online" : "offline"}"></span>
            </div>
            <div class="chat-contact-info">
                <div class="chat-contact-name">${c.name}</div>
                <div class="chat-contact-last">${c.lastMessage}</div>
            </div>
            <div class="chat-contact-meta">
                <span class="chat-contact-time">${c.lastTime}</span>
                ${c.unread ? `<span class="chat-unread-badge">${c.unread}</span>` : ""}
            </div>
        </li>
    `).join("");

    list.querySelectorAll(".chat-contact-item").forEach(item => {
        item.addEventListener("click", () => openChat(item.getAttribute("data-chat-id")));
    });
}

function renderMessages() {
    const container = document.getElementById("chatMessages");
    if (!container) return;
    const messages = getMessages(activeChatId);
    container.innerHTML = messages.map(m => `
        <div class="chat-bubble chat-bubble-${m.sender}">
            <span class="chat-bubble-text">${m.text}</span>
            <span class="chat-bubble-time">${m.time}</span>
        </div>
    `).join("");
    container.scrollTop = container.scrollHeight;
}

function renderHeader() {
    const contact = getContact(activeChatId);
    const nameEl = document.querySelector("#chatConversationHeader .chat-conversation-name");
    const statusEl = document.querySelector("#chatConversationHeader .chat-conversation-status");
    if (!contact) {
        nameEl.textContent = "Select a conversation";
        if (statusEl) statusEl.remove();
        return;
    }
    nameEl.textContent = contact.name;
    if (statusEl) {
        statusEl.textContent = contact.online ? "Online" : "Offline";
        statusEl.className = `chat-conversation-status ${contact.online ? "online" : "offline"}`;
    } else {
        nameEl.insertAdjacentHTML("afterend", `
            <span class="chat-conversation-status ${contact.online ? "online" : "offline"}">${contact.online ? "Online" : "Offline"}</span>
        `);
    }
}

function showConversationScreen() {
    document.getElementById("chatListScreen").classList.remove("active");
    document.getElementById("chatConversationScreen").classList.add("active");
}

function showListScreen() {
    document.getElementById("chatConversationScreen").classList.remove("active");
    document.getElementById("chatListScreen").classList.add("active");
}

function openChat(chatId) {
    activeChatId = chatId;
    const contact = getContact(chatId);
    if (contact) contact.unread = 0;

    document.getElementById("chatMessageInput").disabled = false;
    document.getElementById("chatSendBtn").disabled = false;

    renderContactList(document.getElementById("chatSearchInput").value);
    renderHeader();
    renderMessages();
    showConversationScreen();
}

function handleSend() {
    const input = document.getElementById("chatMessageInput");
    const text = input.value.trim();
    if (!text || !activeChatId) return;
    sendMessage(activeChatId, text);
    input.value = "";
    renderMessages();
    renderContactList(document.getElementById("chatSearchInput").value);
}

export function initChatPanel() {
    const searchInput = document.getElementById("chatSearchInput");
    const sendBtn = document.getElementById("chatSendBtn");
    const messageInput = document.getElementById("chatMessageInput");
    const backBtn = document.getElementById("chatBackBtn");
    if (!searchInput) return;

    searchInput.addEventListener("input", () => renderContactList(searchInput.value));
    sendBtn.addEventListener("click", handleSend);
    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleSend();
    });
    backBtn.addEventListener("click", showListScreen);

    renderContactList();
}
