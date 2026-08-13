// Component: Login Screen
import { login } from "../services/authService.js";

export function initLoginScreen(onSuccess) {
    const form = document.getElementById("loginForm");
    const errorEl = document.getElementById("loginError");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;
        const user = login(username, password);
        if (!user) {
            errorEl.textContent = "Invalid username or password.";
            return;
        }
        errorEl.textContent = "";
        form.reset();
        onSuccess();
    });
}
