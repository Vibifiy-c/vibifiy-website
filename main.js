// ============================================
// 1. SUPABASE CONFIGURATION
// ============================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://pmpvchacduibmciylhni.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_izSgbuQ0uXigeBJIGfSL0g_ezAivfLI'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ============================================
// 2. LIVE GITHUB API INTEGRATION
// ============================================
const GITHUB_ORG = 'Vibifiy-c';

async function fetchGitHubData() {
    try {
        let response = await fetch(`https://api.github.com/orgs/${GITHUB_ORG}/repos?sort=updated&direction=desc`);
        
        if (!response.ok) {
            response = await fetch(`https://api.github.com/users/${GITHUB_ORG}/repos?sort=updated&direction=desc`);
        }
        
        if (!response.ok) throw new Error('Failed to fetch repositories');
        
        const repos = await response.json();
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
                <span> ${repo.forks_count}</span>
            </div>
            <a href="${repo.html_url}" target="_blank" class="project-link">View on GitHub ↗</a>
        </article>
    `).join('');
}

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
// 3. DOWNLOAD PAGE (Hardcoded Data)
// ============================================
const downloadProducts = [
    { name: "VibiClaw", version: "v2.4.0", description: "Advanced code editor.", size: "12.4 MB", downloads: 15420, license: "MIT" },
    { name: "Vibrium", version: "v1.8.3", description: "High-performance runtime.", size: "8.7 MB", downloads: 12890, license: "Apache 2.0" },
    { name: "Vibipass", version: "v3.1.0", description: "Secure password manager.", size: "5.2 MB", downloads: 16920, license: "GPL-3.0" }
];

function renderDownloads() {
    const container = document.getElementById('downloadOptions');
    if (!container) return;
    container.innerHTML = downloadProducts.map(product => `
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
// 4. THEME & NAVIGATION
// ============================================
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('vibifiy-theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
    const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('vibifiy-theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '';
});

const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

function navigateTo(pageId) {
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
    window.scrollTo(0, 0);
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('href').substring(1);
        navigateTo(pageId);
    });
});

window.addEventListener('popstate', () => {
    const hash = window.location.hash.substring(1);
    navigateTo(hash || 'dashboard');
});

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
        alert('Review saved to the cloud! ️');
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

document.addEventListener('DOMContentLoaded', () => {
    renderDownloads();
    renderDashboard(); // NEW: Fetch from GitHub API
    
    const hash = window.location.hash.substring(1);
    navigateTo(hash || 'dashboard');
});
