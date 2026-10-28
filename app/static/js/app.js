/**
 * PROJECT COMPASS: CLIENT INTERACTIVITY & ANALYTICS
 * Zero external libraries / 100% Vanilla JS
 */

// Global state & UTM tracking
const AppState = {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    ref: null,
    sessionId: null
};

// Initialize UTM parameters from URL
function initTracking() {
    const params = new URLSearchParams(window.location.search);
    AppState.utm_source = params.get("utm_source") || sessionStorage.getItem("utm_source");
    AppState.utm_medium = params.get("utm_medium") || sessionStorage.getItem("utm_medium");
    AppState.utm_campaign = params.get("utm_campaign") || sessionStorage.getItem("utm_campaign");
    AppState.ref = params.get("ref") || sessionStorage.getItem("ref");

    // Persist in session
    if (AppState.utm_source) sessionStorage.setItem("utm_source", AppState.utm_source);
    if (AppState.utm_medium) sessionStorage.setItem("utm_medium", AppState.utm_medium);
    if (AppState.utm_campaign) sessionStorage.setItem("utm_campaign", AppState.utm_campaign);
    if (AppState.ref) sessionStorage.setItem("ref", AppState.ref);

    let sid = sessionStorage.getItem("compass_session_id");
    if (!sid) {
        sid = "sess_" + Math.random().toString(36).substring(2, 12);
        sessionStorage.setItem("compass_session_id", sid);
    }
    AppState.sessionId = sid;
}

// Analytics event logger
async function trackEvent(eventName, contractId = null, metadata = {}) {
    try {
        const payload = {
            event_name: eventName,
            contract_id: contractId,
            utm_source: AppState.utm_source,
            utm_medium: AppState.utm_medium,
            utm_campaign: AppState.utm_campaign,
            ref: AppState.ref,
            session_id: AppState.sessionId,
            metadata: metadata
        };
        await fetch("/api/analytics/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.warn("Analytics event failed silently:", err);
    }
}

// Toast notification helper
function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>🧭</span> <div>${message}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Copy to clipboard helper
function copyToClipboard(text, successMsg = "Link copied to clipboard!") {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(successMsg, "success");
        }).catch(() => {
            prompt("Copy this link:", text);
        });
    } else {
        prompt("Copy this link:", text);
    }
}

// Chip toggle helper for multi-selects
function toggleChip(element, hiddenInputId) {
    element.classList.toggle("selected");
    const container = element.parentElement;
    const selectedChips = container.querySelectorAll(".chip.selected");
    const values = Array.from(selectedChips).map(c => c.getAttribute("data-val") || c.innerText.trim());
    
    const hiddenInput = document.getElementById(hiddenInputId);
    if (hiddenInput) {
        hiddenInput.value = values.join(",");
    }
}

// Track workshop CTA clicks
function handleWorkshopCtaClick(sourceLocation, contractId = null) {
    trackEvent("workshop_cta_clicked", contractId, { location: sourceLocation });
}

// Load sample project into form
async function loadSampleProject(sampleId) {
    try {
        const res = await fetch(`/api/projects/samples/${sampleId}`);
        if (!res.ok) throw new Error("Failed to load sample");
        const sample = await res.json();
        
        // Fill domain & constraints
        const domainSelect = document.getElementById("domainSelect");
        if (domainSelect) domainSelect.value = sample.domain;
        
        const expSelect = document.getElementById("experienceSelect");
        if (expSelect && sample.default_constraints) expSelect.value = sample.default_constraints.experience;

        const timeInput = document.getElementById("timeWeeksInput");
        if (timeInput && sample.default_constraints) timeInput.value = sample.default_constraints.time_weeks;

        const teamInput = document.getElementById("teamSizeInput");
        if (teamInput && sample.default_constraints) teamInput.value = sample.default_constraints.team_size;

        // Fill Idea #1
        const idea1Title = document.getElementById("idea_1_title");
        const idea1Desc = document.getElementById("idea_1_desc");
        if (idea1Title) idea1Title.value = sample.title;
        if (idea1Desc) idea1Desc.value = sample.description;

        showToast(`Loaded sample: ${sample.title}`, "success");
        idea1Title?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
        showToast("Error loading sample project.", "error");
    }
}

// Bootstrapping
document.addEventListener("DOMContentLoaded", () => {
    initTracking();
    
    // Log page view
    const path = window.location.pathname;
    let eventName = "page_view";
    if (path === "/") eventName = "view_home";
    else if (path.startsWith("/compare")) eventName = "view_compare";
    else if (path.startsWith("/contract")) eventName = "view_contract";
    else if (path.startsWith("/challenge")) eventName = "view_challenge";
    else if (path.startsWith("/register")) eventName = "view_register";
    else if (path.startsWith("/admin")) eventName = "view_admin";
    else if (path.startsWith("/whatsapp")) eventName = "view_whatsapp_sim";
    
    trackEvent(eventName, null, { path: path });
});

