// --- 1. MOCK DATA ---
const vibifiyData = {
    stats: { projects: 12, downloads: 45230, contributors: 38 },
    chartData: [120, 190, 150, 250, 220, 300, 350],
    projects: [
        { name: "vibifiy-core", desc: "The core engine for Vibifiy applications.", downloads: 15400, stars: 342, lang: "JavaScript" },
        { name: "vibifiy-cli", desc: "Command line interface for rapid scaffolding.", downloads: 8900, stars: 128, lang: "TypeScript" },
        { name: "vibifiy-ui", desc: "Lightweight, accessible UI components.", downloads: 12100, stars: 215, lang: "JavaScript" },
        { name: "vibifiy-docs", desc: "Documentation site generator.", downloads: 4500, stars: 89, lang: "Markdown" },
        { name: "vibifiy-plugin-auth", desc: "Authentication plugin for Vibifiy core.", downloads: 4330, stars: 76, lang: "JavaScript" }
    ],
    downloads: [
        { name: "Vibifiy Core (v2.4.0)", size: "12.4 MB", link: "#" },
        { name: "Vibifiy CLI (v1.1.2)", size: "4.2 MB", link: "#" },
        { name: "Vibifiy UI Kit (v3.0.0)", size: "8.7 MB", link: "#" }
    ]
};

// --- 2. THEME MANAGEMENT ---
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('vibifiy-theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('vibifiy-theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    drawChart();
});

// --- 3. SPA ROUTING (JS-Heavy requirement!) ---
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');

function navigateTo(pageId) {
    pages.forEach(p => p.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));

    const targetPage = document.getElementById(`page-${pageId}`);
    const targetLink = document.querySelector(`a[href="#${pageId}"]`);

    if (targetPage) targetPage.classList.add('active');
    if (targetLink) targetLink.classList.add('active');
    
    // Re-render charts if returning to dashboard
    if (pageId === 'dashboard') drawChart();
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('href').substring(1);
        history.pushState(null, '', `#${pageId}`);
        navigateTo(pageId);
    });
});

window.addEventListener('popstate', () => {
    const pageId = window.location.hash.substring(1) || 'dashboard';
    navigateTo(pageId);
});

// --- 4. DASHBOARD RENDERING ---
function renderStats() {
    const statsGrid = document.getElementById('statsGrid');
    const stats = [
        { label: 'Total Projects', value: vibifiyData.stats.projects },
        { label: 'Total Downloads', value: vibifiyData.stats.downloads },
        { label: 'Contributors', value: vibifiyData.stats.contributors }
    ];
    statsGrid.innerHTML = stats.map(stat => `
        <div class="stat-card"><h3>${stat.label}</h3><div class="value" data-target="${stat.value}">0</div></div>
    `).join('');
    animateCounters();
}

function renderProjects(filterText = '') {
    const projectsList = document.getElementById('projectsList');
    const filtered = vibifiyData.projects.filter(p => p.name.toLowerCase().includes(filterText.toLowerCase()));
    projectsList.innerHTML = filtered.length ? filtered.map(p => `
        <article class="project-card"><h3>${p.name}</h3><p>${p.desc}</p>
        <div class="project-meta"><span>⭐ ${p.stars}</span><span>⬇️ ${p.downloads.toLocaleString()}</span><span class="badge">${p.lang}</span></div></article>
    `).join('') : '<p style="grid-column: 1/-1; text-align: center;">No projects found.</p>';
}

function renderDownloads() {
    const container = document.getElementById('downloadOptions');
    container.innerHTML = vibifiyData.downloads.map(d => `
        <a href="${d.link}" class="download-btn"><span><strong>${d.name}</strong><br><small>${d.size}</small></span><span>️ Download</span></a>
    `).join('');
}

// --- 5. ANIMATED COUNTERS & CANVAS CHART ---
function animateCounters() {
    document.querySelectorAll('.value').forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let current = 0;
        const increment = target / 60;
        const update = () => {
            current += increment;
            if (current < target) { counter.innerText = Math.ceil(current).toLocaleString(); requestAnimationFrame(update); }
            else { counter.innerText = target.toLocaleString(); }
        };
        update();
    });
}

function drawChart() {
    const canvas = document.getElementById('downloadChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const data = vibifiyData.chartData;
    const max = Math.max(...data) * 1.2;
    const width = rect.width; const height = rect.height;
    const padding = 20; const stepX = (width - padding * 2) / (data.length - 1);
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const color = isDark ? '#a29bfe' : '#6c5ce7';
    const gridColor = isDark ? '#2d2d2d' : '#e9ecef';

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + (height - padding * 2) * (i / 4);
        ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(width - padding, y); ctx.stroke();
    }
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath();
    data.forEach((val, i) => {
        const x = padding + i * stepX;
        const y = height - padding - (val / max) * (height - padding * 2);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.fillStyle = isDark ? '#121212' : '#ffffff';
    data.forEach((val, i) => {
        const x = padding + i * stepX;
        const y = height - padding - (val / max) * (height - padding * 2);
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
}

// --- 6. REVIEWS PAGE LOGIC (LocalStorage + DOM) ---
let selectedRating = 0;
const stars = document.querySelectorAll('#starRating span');
stars.forEach(star => {
    star.addEventListener('click', () => {
        selectedRating = +star.getAttribute('data-value');
        stars.forEach((s, i) => s.classList.toggle('active', i < selectedRating));
    });
});

function renderReviews() {
    const reviews = JSON.parse(localStorage.getItem('vibifiy-reviews') || '[]');
    const container = document.getElementById('reviewsList');
    container.innerHTML = reviews.length ? reviews.map(r => `
        <div class="review-card">
            <div class="review-header"><span>${r.name}</span><span class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span></div>
            <p>${r.text}</p>
        </div>
    `).join('') : '<p>No reviews yet. Be the first!</p>';
}

document.getElementById('reviewForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (selectedRating === 0) { alert('Please select a star rating!'); return; }
    const name = document.getElementById('reviewName').value;
    const text = document.getElementById('reviewText').value;
    const reviews = JSON.parse(localStorage.getItem('vibifiy-reviews') || '[]');
    reviews.unshift({ name, rating: selectedRating, text });
    localStorage.setItem('vibifiy-reviews', JSON.stringify(reviews));
    e.target.reset();
    selectedRating = 0; stars.forEach(s => s.classList.remove('active'));
    renderReviews();
});

// --- 7. BUG REPORT LOGIC (Real-time Validation) ---
const bugForm = document.getElementById('bugForm');
const bugTitle = document.getElementById('bugTitle');
const bugDesc = document.getElementById('bugDesc');

function validateField(field) {
    if (!field.value.trim()) field.classList.add('error');
    else field.classList.remove('error');
}

bugTitle.addEventListener('input', () => validateField(bugTitle));
bugDesc.addEventListener('input', () => validateField(bugDesc));

bugForm.addEventListener('submit', (e) => {
    e.preventDefault();
    validateField(bugTitle); validateField(bugDesc);
    if (bugTitle.classList.contains('error') || bugDesc.classList.contains('error')) return;
    
    const btn = document.getElementById('submitBugBtn');
    const originalText = btn.innerText;
    btn.innerText = 'Submitting...'; btn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        btn.innerText = 'Reported Successfully! ✓'; btn.style.background = 'var(--success)';
        bugForm.reset();
        setTimeout(() => { btn.innerText = originalText; btn.style.background = ''; btn.disabled = false; }, 3000);
    }, 1500);
});

// --- 8. INITIALIZATION ---
document.getElementById('searchInput').addEventListener('input', (e) => renderProjects(e.target.value));
window.addEventListener('resize', drawChart);

document.addEventListener('DOMContentLoaded', () => {
    const initialPage = window.location.hash.substring(1) || 'dashboard';
    navigateTo(initialPage);
    renderStats(); renderProjects(); renderDownloads(); renderReviews(); drawChart();
});
