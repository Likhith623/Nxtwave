/**
 * PROJECT COMPASS — WORLD-CLASS CLIENT CORE (v2.0)
 * Features:
 *   - Dark/Light Theme Switching with smooth transitions & persistence
 *   - Hero Interactive Particle Network Canvas
 *   - Scroll-Reveal IntersectionObserver
 *   - Dynamic Animated Score Bars
 *   - Mobile Menu Drawer & Micro-interactions
 *   - Toast Notification Physics Engine
 *   - UTM & Attribution Tracking Engine
 *   - 100% Zero External Dependencies / Native High-Performance JS
 */

// -----------------------------------------------------------------------------
// 1. GLOBAL STATE & TRACKING
// -----------------------------------------------------------------------------
const AppState = {
    theme: 'dark',
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    ref: null,
    sessionId: null
};

// -----------------------------------------------------------------------------
// 2. THEME ENGINE (DARK / LIGHT TOGGLE)
// -----------------------------------------------------------------------------
function initTheme() {
    const savedTheme = localStorage.getItem("compass_theme") || "dark";
    setTheme(savedTheme, false);

    const toggleBtn = document.getElementById("themeToggleBtn");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme") || "dark";
            const next = current === "dark" ? "light" : "dark";
            setTheme(next, true);
        });
    }

    const mobileToggleBtn = document.getElementById("mobileThemeToggleBtn");
    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme") || "dark";
            const next = current === "dark" ? "light" : "dark";
            setTheme(next, true);
        });
    }
}

function setTheme(theme, animate = true) {
    AppState.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("compass_theme", theme);

    // Update icons
    const icons = document.querySelectorAll(".theme-icon");
    icons.forEach(icon => {
        icon.textContent = theme === "dark" ? "🌙" : "☀️";
    });

    if (animate) {
        showToast(`Switched to ${theme === "dark" ? "Dark (Deep Space)" : "Light (Nordic Clean)"} mode`, "info");
    }
}

// -----------------------------------------------------------------------------
// 3. UTM ATTRIBUTION & SESSION TRACKING
// -----------------------------------------------------------------------------
function initTracking() {
    const params = new URLSearchParams(window.location.search);
    AppState.utm_source = params.get("utm_source") || sessionStorage.getItem("utm_source") || "direct";
    AppState.utm_medium = params.get("utm_medium") || sessionStorage.getItem("utm_medium") || "web";
    AppState.utm_campaign = params.get("utm_campaign") || sessionStorage.getItem("utm_campaign") || "project_compass_48h";
    AppState.ref = params.get("ref") || sessionStorage.getItem("ref");

    sessionStorage.setItem("utm_source", AppState.utm_source);
    sessionStorage.setItem("utm_medium", AppState.utm_medium);
    sessionStorage.setItem("utm_campaign", AppState.utm_campaign);
    if (AppState.ref) sessionStorage.setItem("ref", AppState.ref);

    let sid = sessionStorage.getItem("compass_session_id");
    if (!sid) {
        sid = "sess_" + Math.random().toString(36).substring(2, 12);
        sessionStorage.setItem("compass_session_id", sid);
    }
    AppState.sessionId = sid;
}

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
        // Fail silently to avoid interrupting student experience
    }
}

function handleWorkshopCtaClick(sourceLocation, contractId = null) {
    trackEvent("workshop_cta_clicked", contractId, { location: sourceLocation });
}

// -----------------------------------------------------------------------------
// 4. HERO CONSTELLATION CANVAS (INTERACTIVE PARTICLES)
// -----------------------------------------------------------------------------
function initHeroCanvas() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    const particleCount = window.innerWidth < 768 ? 24 : 45;
    let width, height;

    function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = (Math.random() - 0.5) * 0.7;
            this.radius = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw(theme) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = theme === "dark" ? "rgba(6, 182, 212, 0.7)" : "rgba(59, 130, 246, 0.5)";
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    let mouse = { x: null, y: null };
    window.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    window.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);
        const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
        const maxDist = 120;

        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            p1.update();
            p1.draw(currentTheme);

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * (currentTheme === "dark" ? 0.22 : 0.12);
                    ctx.strokeStyle = currentTheme === "dark" 
                        ? `rgba(6, 182, 212, ${alpha})` 
                        : `rgba(59, 130, 246, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// -----------------------------------------------------------------------------
// 5. SCROLL-REVEAL OBSERVER
// -----------------------------------------------------------------------------
function initScrollReveal() {
    const reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    reveals.forEach(el => observer.observe(el));
}

// -----------------------------------------------------------------------------
// 6. SCORE BARS ANIMATOR
// -----------------------------------------------------------------------------
function initScoreBars() {
    const bars = document.querySelectorAll(".score-fill");
    if (!bars.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetWidth = entry.target.getAttribute("data-score");
                if (targetWidth) {
                    entry.target.style.width = targetWidth + "%";
                }
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    bars.forEach(b => observer.observe(b));
}

// -----------------------------------------------------------------------------
// 7. TOAST NOTIFICATION ENGINE
// -----------------------------------------------------------------------------
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
    
    let icon = "🧭";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "⚠️";
    if (type === "info") icon = "💡";

    toast.innerHTML = `<span style="font-size:1.2rem;">${icon}</span> <div>${message}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(15px) scale(0.95)";
        setTimeout(() => toast.remove(), 350);
    }, 3800);
}

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

// -----------------------------------------------------------------------------
// 8. INTERACTIVE CHIPS & SAMPLES LOADER
// -----------------------------------------------------------------------------
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

async function loadSampleProject(sampleId) {
    try {
        const res = await fetch(`/api/projects/samples/${sampleId}`);
        if (!res.ok) throw new Error("Failed to load sample");
        const sample = await res.json();
        
        // Fill form fields
        const domainSelect = document.getElementById("domainSelect");
        if (domainSelect) domainSelect.value = sample.domain;
        
        const expSelect = document.getElementById("experienceSelect");
        if (expSelect && sample.default_constraints) expSelect.value = sample.default_constraints.experience;

        const timeInput = document.getElementById("timeWeeksInput");
        if (timeInput && sample.default_constraints) timeInput.value = sample.default_constraints.time_weeks;

        const teamInput = document.getElementById("teamSizeInput");
        if (teamInput && sample.default_constraints) teamInput.value = sample.default_constraints.team_size;

        const idea1Title = document.getElementById("idea_1_title");
        const idea1Desc = document.getElementById("idea_1_desc");
        if (idea1Title) idea1Title.value = sample.title;
        if (idea1Desc) idea1Desc.value = sample.description;

        showToast(`Loaded sample: ${sample.title}`, "success");
        idea1Title?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
        showToast("Error loading sample project.", "error");
    }
}

// -----------------------------------------------------------------------------
// 9. MOBILE MENU DRAWER TOGGLE
// -----------------------------------------------------------------------------
function initMobileMenu() {
    const hamburger = document.getElementById("hamburgerBtn");
    const menu = document.getElementById("mobileMenu");
    if (!hamburger || !menu) return;

    hamburger.addEventListener("click", () => {
        menu.classList.toggle("open");
        hamburger.textContent = menu.classList.contains("open") ? "✕" : "☰";
    });

    // Close on navigation link click
    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            menu.classList.remove("open");
            hamburger.textContent = "☰";
        });
    });
}

// -----------------------------------------------------------------------------
// 10. BOOTSTRAP ON DOM READY
// -----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initTracking();
    initHeroCanvas();
    initScrollReveal();
    initScoreBars();
    initMobileMenu();

    // Log page view event
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
