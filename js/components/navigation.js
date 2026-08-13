// Component: Navigation
export function initNavigation() {
    const links = document.querySelectorAll(".bottom-nav-link");
    const views = document.querySelectorAll(".view");

    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const viewId = `view-${link.getAttribute("data-view")}`;
            views.forEach(v => v.classList.remove("active"));
            const target = document.getElementById(viewId);
            if (target) target.classList.add("active");

            links.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        });
    });
}
