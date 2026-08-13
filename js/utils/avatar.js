// Utils: Avatar
export function renderAvatar(el, user) {
    if (!el || !user) return;
    if (user.photo) {
        el.innerHTML = `<img src="${user.photo}" alt="${user.name}">`;
    } else {
        el.textContent = user.name.charAt(0);
    }
}
