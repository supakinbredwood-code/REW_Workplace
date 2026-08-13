// Utils: Format
export function formatTime(date) {
    return date.toLocaleTimeString("en-GB", { hour12: false });
}

export function formatDateLong(date) {
    return date.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export function formatDuration(ms) {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
}
