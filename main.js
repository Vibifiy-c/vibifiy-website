// --- 1. MOCK DATA (Replace with real GitHub API fetch later) ---
const vibifiyData = {
    stats: { projects: 12, downloads: 45230, contributors: 38 },
    chartData: [120, 190, 150, 250, 220, 300, 350], // Last 7 days
    projects: [
        { name: "vibifiy-core", desc: "The core engine for Vibifiy applications.", downloads: 15400, stars: 342, lang: "JavaScript" },
        { name: "vibifiy-cli", desc: "Command line interface for rapid scaffolding.", downloads: 8900, stars: 128, lang: "TypeScript" },
        { name: "vibifiy-ui", desc: "Lightweight, accessible UI components.", downloads: 12100, stars: 215, lang: "JavaScript" },
        { name: "vibifiy-docs", desc: "Documentation site generator.", downloads: 4500, stars: 89, lang: "Markdown" },
        { name: "vibifiy-plugin-auth", desc: "Authentication plugin for Vibifiy core.", downloads: 4330, stars: 76, lang: "JavaScript" }
    ]
};

// --- 2. STATE & THEME MANAGEMENT ---
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
    drawChart(); // Redraw chart to match new theme colors
});

// --- 3. DYNAMIC DOM RENDERING ---
function renderStats() {
    const statsGrid = document.getElementById('statsGrid');
    const stats = [
        { label: 'Total Projects', value: vibifiyData.stats.projects },
        { label: 'Total Downloads', value: vibifiyData.stats.downloads },
        { label: 'Contributors', value: vibifiyData.stats.contributors }
    ];

    statsGrid.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <h3>${stat.label}</h3>
            <div class="value" data-target="${stat.value}">0</div>
        </div>
    `).join('');

    // Trigger animated counters
    animateCounters();
}

function renderProjects(filterText = '') {
    const projectsList = document.getElementById('projectsList');
    const filtered = vibifiyData.projects.filter(p => 
        p.name.toLowerCase().includes(filterText.toLowerCase()) || 
        p.desc.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filtered.length === 0) {
        projectsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No projects found.</p>';
        return;
    }

    projectsList.innerHTML = filtered.map(project => `
        <article class="project-card">
            <h3>${project.name}</h3>
            <p>${project.desc}</p>
            <div class="project-meta">
                <span>⭐ ${project.stars}</span>
                <span>⬇️ ${project.downloads.toLocaleString()}</span>
                <span class="badge">${project.lang}</span>
            </div>
        </article>
    `).join('');
}

// --- 4. ADVANCED JS: ANIMATED COUNTERS ---
function animateCounters() {
    const counters = document.querySelectorAll('.value');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 1500; // ms
        const increment = target / (duration / 16); // 60fps
        
        let current = 0;
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };
        updateCounter();
    });
}

// --- 5. ADVANCED JS: CUSTOM CANVAS CHART (No heavy libraries!) ---
function drawChart() {
    const canvas = document.getElementById('downloadChart');
    const ctx = canvas.getContext('2d');
    
    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const data = vibifiyData.chartData;
    const max = Math.max(...data) * 1.2;
    const width = rect.width;
    const height = rect.height;
    const padding = 20;
    const stepX = (width - padding * 2) / (data.length - 1);

    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const color = isDark ? '#a29bfe' : '#6c5ce7';
    const gridColor = isDark ? '#2d2d2d' : '#e9ecef';

    ctx.clearRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + (height - padding * 2) * (i / 4);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    // Draw line chart
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((val, i) => {
        const x = padding + i * stepX;
        const y = height - padding - (val / max) * (height - padding * 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = isDark ? '#121212' : '#ffffff';
    data.forEach((val, i) => {
        const x = padding + i * stepX;
        const y = height - padding - (val / max) * (height - padding * 2);
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    });
}

// --- 6. EVENT LISTENERS & INITIALIZATION ---
document.getElementById('searchInput').addEventListener('input', (e) => {
    renderProjects(e.target.value); // Real-time filtering
});

// Handle window resize for canvas
window.addEventListener('resize', () => {
    drawChart();
});

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    renderStats();
    renderProjects();
    drawChart();
});
