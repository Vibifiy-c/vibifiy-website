// ============================================
// 1. SUPABASE CONFIGURATION
// ============================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://pmpvchacduibmciylhni.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_izSgbuQ0uXigeBJIGfSL0g_ezAivfLI' // Replace if needed

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ============================================
// 2. LIVE GITHUB API INTEGRATION
// ============================================
const GITHUB_ORG = 'Vibifiy-c';

async function fetchGitHubData() {
    try {
        // Try fetching as an Organization first
        let response = await fetch(`https://api.github.com/orgs/${GITHUB_ORG}/repos?sort=updated&direction=desc`);
        
        // Fallback: If it's actually a User account, not an Org, try the user endpoint
        if (!response.ok) {
            response = await fetch(`https://api.github.com/users/${GITHUB_ORG}/repos?sort=updated&direction=desc`);
        }
        
        if (!response.ok) throw new Error('Failed to fetch repositories');
        
        const repos = await response.json();
        
        // Calculate total stats
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
        
        return { repos, totalStars, totalForks, totalCount: repos.length };
    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        return null;
    }
}

async function renderDashboard() {
    const projectsList = document.getElementById('projectsList');
    const orgStats = document.getElementById('orgStats');
    
    if (!projectsList || !orgStats) return;

    const data = await fetchGitHubData();

    if (!data || data.repos.length === 0) {
        projectsList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">Unable to load projects from GitHub.</p>
                <a href="https://github.com/${GITHUB_ORG}" target="_blank" class="btn-primary" style="width: auto; display: inline-block;">View on GitHub directly</a>
            </div>`;
        return;
    }

    // Render Stats
    orgStats.innerHTML = `
        <div class="stat-card">
            <h3>Total Projects</h3>
            <div class="value">${data.totalCount}</div>
        </div>
        <div class="stat-card">
            <h3>Total Stars</h3>
            <div class="value">${data.totalStars.toLocaleString()}</div>
        </div>
        <div class="stat-card">
            <h3>Total Forks</h3>
            <div class="value">${data.totalForks.toLocaleString()}</div>
        </div>
    `;

    // Render Projects Grid
    projectsList.innerHTML = data.repos.map(repo => `
        <article class="project-card">
            <div class="project-header">
                <h3>${repo.name}</h3>
                ${repo.private ? '<span class="badge" style="background: var(--text-secondary);">Private</span>' : '<span class="badge">Public</span>'}
            </div>
            <p class="project-desc">${repo.description || 'No description provided.'}</p>
            <div class="project-meta">
                <span class="lang-badge">
                    <span class="lang-dot" style="background-color: ${getLanguageColor(repo.language)}"></span>
                    ${repo.language || 'Unknown'}
                </span>
                <span>⭐ ${repo.stargazers_count}</span>
                <span>🍴 ${repo.forks_count}</span>
            </div>
            <a href="${repo.html_url}" target="_blank" class="project-link">View on GitHub ↗</a>
        </article>
    `).join('');
}

// Helper: GitHub language colors
function getLanguageColor(lang) {
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#3178c6',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Python': '#3572A5',
        'Java': '#b07219',
        'C++': '#f34b7d',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Shell': '#89e051'
    };
    return colors[lang] || '#8b949e';
}
// ============================================
// 3. THEME & NAVIGATION (FIXED)
// ============================================
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('vibifiy-theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
    const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('vibifiy-theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    drawChart();
});

const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

function navigateTo(pageId) {
    // Map the URL hash to the actual HTML element ID
    const idMap = {
        'dashboard': 'page-dashboard',
        'download': 'page-download',
        'reviews': 'page-reviews',
        'bug': 'page-bug'
    };
    
    const targetId = idMap[pageId] || 'page-dashboard';
    
    pages.forEach(page => page.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));
    
    const targetPage = document.getElementById(targetId);
    if (targetPage) targetPage.classList.add('active');
    
    const activeLink = document.querySelector(`.nav-link[href="#${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');
    
    history.pushState({ page: pageId }, '', `#${pageId}`);
    
    if (pageId === 'dashboard') setTimeout(drawChart, 100);
    if (pageId === 'reviews') loadReviews();
    
    window.scrollTo(0, 0);
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('href').substring(1); // Gets 'dashboard', 'download', etc.
        navigateTo(pageId);
    });
});

window.addEventListener('popstate', () => {
    const hash = window.location.hash.substring(1);
    navigateTo(hash || 'dashboard');
});

// ============================================
// 4. DASHBOARD FUNCTIONS
// ============================================
function renderStats() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;
    statsGrid.innerHTML = [
        { label: 'Total Projects', value: vibifiyData.stats.projects },
        { label: 'Total Downloads', value: vibifiyData.stats.downloads },
        { label: 'Contributors', value: vibifiyData.stats.contributors }
    ].map(stat => `
        <div class="stat-card">
            <h3>${stat.label}</h3>
            <div class="value" data-target="${stat.value}">0</div>
        </div>
    `).join('');
    animateCounters();
}

function renderProjects(filterText = '') {
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return;
    const filtered = vibifiyData.projects.filter(p => p.name.toLowerCase().includes(filterText.toLowerCase()));
    projectsList.innerHTML = filtered.length ? filtered.map(p => `
        <article class="project-card">
            <h3>${p.name}</h3><p>${p.desc}</p>
            <div class="project-meta"><span>⭐ ${p.stars}</span><span>⬇️ ${p.downloads.toLocaleString()}</span><span class="badge">${p.lang}</span></div>
        </article>
    `).join('') : '<p style="grid-column: 1/-1; text-align: center;">No projects found.</p>';
}

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

function renderDownloads() {
    const container = document.getElementById('downloadOptions'); // FIXED ID
    if (!container) return;
    container.innerHTML = vibifiyData.downloads.map(product => `
        <a href="#" class="download-btn" onclick="alert('Download starting for ${product.name}!'); return false;">
            <span>
                <strong>${product.name}</strong><br>
                <small style="color: var(--text-secondary);">${product.version} • ${product.license}</small>
            </span>
            <span style="font-weight: 600; color: var(--accent);">Download ⬇️</span>
        </a>
    `).join('');
}

// ============================================
// 5. SUPABASE: REVIEWS
// ============================================
let selectedRating = 0;
const stars = document.querySelectorAll('#starRating span');
stars.forEach(star => {
    star.addEventListener('click', () => {
        selectedRating = +star.getAttribute('data-value');
        stars.forEach((s, i) => s.classList.toggle('active', i < selectedRating));
    });
    star.addEventListener('mouseenter', () => {
        const value = +star.getAttribute('data-value');
        stars.forEach((s, i) => s.classList.toggle('active', i < value));
    });
});
document.getElementById('starRating')?.addEventListener('mouseleave', () => {
    stars.forEach((s, i) => s.classList.toggle('active', i < selectedRating));
});

async function loadReviews() {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    container.innerHTML = '<p style="text-align: center;">Loading reviews from server...</p>';

    const { data: reviews, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });

    if (error) {
        container.innerHTML = '<p style="text-align: center; color: var(--error);">Error loading reviews.</p>';
        return;
    }

    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No reviews yet. Be the first!</p>';
        return;
    }

    container.innerHTML = reviews.map(review => {
        const date = new Date(review.created_at).toLocaleDateString();
        const starsStr = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        return `
            <div class="review-card">
                <div class="review-header">
                    <h4>${escapeHtml(review.name)}</h4>
                    <span class="review-stars">${starsStr}</span>
                </div>
                <p class="review-text">${escapeHtml(review.text)}</p>
                <span class="review-date">${date}</span>
            </div>
        `;
    }).join('');
}

document.getElementById('reviewForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (selectedRating === 0) { alert('Please select a star rating!'); return; }
    
    const name = document.getElementById('reviewName').value;
    const text = document.getElementById('reviewText').value;
    const btn = e.target.querySelector('button');
    
    btn.innerText = 'Submitting...'; btn.disabled = true;

    const { error } = await supabase.from('reviews').insert([{ name, rating: selectedRating, text }]);

    if (error) {
        alert('Error: ' + error.message);
    } else {
        alert('Review saved to the cloud! ☁️');
        e.target.reset();
        selectedRating = 0;
        stars.forEach(s => s.classList.remove('active'));
        loadReviews();
    }
    btn.innerText = 'Submit Review'; btn.disabled = false;
});

// ============================================
// 6. SUPABASE: BUG REPORTS
// ============================================
const bugTitle = document.getElementById('bugTitle');
const bugDesc = document.getElementById('bugDesc');

function validateField(field) {
    if (!field.value.trim()) field.classList.add('error');
    else field.classList.remove('error');
}
bugTitle?.addEventListener('input', () => validateField(bugTitle));
bugDesc?.addEventListener('input', () => validateField(bugDesc));

document.getElementById('bugForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    validateField(bugTitle); validateField(bugDesc);
    if (bugTitle.classList.contains('error') || bugDesc.classList.contains('error')) return;

    const btn = document.getElementById('submitBugBtn');
    const originalText = btn.innerText;
    btn.innerText = 'Submitting...'; btn.disabled = true;

    const { error } = await supabase.from('bug_reports').insert([{
        title: bugTitle.value,
        description: bugDesc.value,
        severity: document.getElementById('bugSeverity').value
    }]);

    if (error) {
        alert('Error: ' + error.message);
    } else {
        alert('Bug report saved to the cloud! 🐛');
        e.target.reset();
    }
    btn.innerText = originalText; btn.disabled = false;
});

// ============================================
// 7. UTILS & INIT
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.getElementById('searchInput')?.addEventListener('input', (e) => renderProjects(e.target.value));

// FIXED: Use correct ID 'page-dashboard' instead of 'dashboard'
window.addEventListener('resize', () => { 
    const dashboardPage = document.getElementById('page-dashboard');
    if (dashboardPage?.classList.contains('active')) drawChart(); 
});

document.addEventListener('DOMContentLoaded', () => {
    renderStats(); 
    renderProjects(); 
    renderDownloads(); 
    drawChart();
    const hash = window.location.hash.substring(1);
    navigateTo(hash || 'dashboard');
});
