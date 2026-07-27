// ============================================
// 1. SUPABASE CONFIGURATION
// ============================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://pmpvchacduibmciylhni.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_izSgbuQ0uXigeBJIGfSL0g_ezAivfLI'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Custom Dialog Functions
function showCustomDialog(title, message, onConfirm) {
    const dialog = document.getElementById('customDialog');
    const titleEl = document.getElementById('customDialogTitle');
    const messageEl = document.getElementById('customDialogMessage');
    const confirmBtn = document.getElementById('customDialogConfirm');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    dialog.style.display = 'flex';
    
    // Remove old event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', () => {
        closeCustomDialog();
        if (onConfirm) onConfirm();
    });
}

function closeCustomDialog() {
    document.getElementById('customDialog').style.display = 'none';
}

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
        <div class="stat-card"><h3>Total Projects</h3><div class="value">${data.totalCount}</div></div>
        <div class="stat-card"><h3>Total Stars</h3><div class="value">${data.totalStars.toLocaleString()}</div></div>
        <div class="stat-card"><h3>Total Forks</h3><div class="value">${data.totalForks.toLocaleString()}</div></div>
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
                <span>🍴 ${repo.forks_count}</span>
            </div>
            <a href="${repo.html_url}" target="_blank" class="project-link">View on GitHub ↗</a>
        </article>
    `).join('');
}

function getLanguageColor(lang) {
    const colors = { 'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'HTML': '#e34c26', 'CSS': '#563d7c', 'Python': '#3572A5', 'Java': '#b07219', 'C++': '#f34b7d', 'Go': '#00ADD8', 'Rust': '#dea584', 'Shell': '#89e051' };
    return colors[lang] || '#8b949e';
}

// ============================================
// 3. DOWNLOAD PAGE
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
            <span><strong>${product.name}</strong><br><small style="color: var(--text-secondary);">${product.version} • ${product.license}</small></span>
            <span style="font-weight: 600; color: var(--accent);">Download ⬇️</span>
        </a>
    `).join('');
}

// ============================================
// 4. THEME & NAVIGATION (ONLY ONE navigateTo!)
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
});

const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

// Enhanced navigation with URL routing
function navigateTo(pageId, params = {}) {
    const idMap = {
        'dashboard': 'page-dashboard',
        'download': 'page-download',
        'reviews': 'page-reviews',
        'bug': 'page-bug',
        'discussions': 'page-discussions',
        'profile': 'page-profile',
        'profile-edit': 'page-profile-edit',
        'settings': 'page-settings'
    };
    
    const targetId = idMap[pageId] || 'page-dashboard';
    
    pages.forEach(page => page.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));
    
    const targetPage = document.getElementById(targetId);
    if (targetPage) targetPage.classList.add('active');
    
    const activeLink = document.querySelector(`.nav-link[href="#${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');
    
    history.pushState({ page: pageId, params }, '', `#${pageId}`);
    
    if (pageId === 'reviews') loadReviews();
    if (pageId === 'discussions') initDiscussions();
    if (pageId === 'profile') loadProfile();
    if (pageId === 'profile-edit') loadProfileEdit();
    if (pageId === 'settings') loadSettingsSection('account');
    
    window.scrollTo(0, 0);
}

// Load settings section
async function loadSettingsSection(section) {
    const content = document.getElementById('settingsContent');
    if (!content) return;
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === section) link.classList.add('active');
    });
    
    const profile = await getOrCreateProfile();
    
    if (section === 'account') {
        content.innerHTML = `
            <h1 class="github-page-title">Public profile</h1>
            <div class="profile-picture-section">
                <div class="profile-picture-left">
                    <h2>Profile picture</h2>
                    <div class="avatar-preview">
                        <div class="avatar-large" id="editProfileAvatar">
                            ${profile.avatar_url ? `<img src="${profile.avatar_url}" alt="${profile.display_name}">` : (profile.display_name || 'A').charAt(0).toUpperCase()}
                        </div>
                    </div>
                    ${profile.avatar_url ? `<button type="button" class="btn-danger" id="deleteAvatarBtn" style="margin-top: 0.75rem;">Delete profile photo</button>` : ''}
                </div>
                <div class="profile-picture-right">
                    <h2>Banner image</h2>
                    <div class="banner-preview" id="editBannerPreview">
                        ${profile.banner_url ? `<img src="${profile.banner_url}" alt="Banner">` : '<span style="color: var(--text-secondary);">No banner</span>'}
                    </div>
                    ${profile.banner_url ? `<button type="button" class="btn-danger" id="deleteBannerBtn" style="margin-top: 0.75rem;">Delete banner image</button>` : ''}
                    <div class="form-group">
                        <label>Upload Banner Image</label>
                        <input type="file" id="editBannerFile" accept="image/*">
                        <small style="color: var(--text-secondary); display: block; margin-top: 0.25rem;">Recommended: 2560 x 1440px (16:9)</small>
                        <small style="color: var(--text-secondary); display: block;">Minimum: 1546 x 423px (safe area)</small>
                        <small style="color: var(--text-secondary); display: block;">Max: 6MB</small>
                    </div>
                    <h2 style="margin-top: 1.5rem;">Profile picture</h2>
                    <div class="form-group">
                        <label>Upload Profile Photo</label>
                        <input type="file" id="editAvatarFile" accept="image/*">
                        <small style="color: var(--text-secondary); display: block; margin-top: 0.25rem;">Recommended: 400x400px (square)</small>
                        <small style="color: var(--text-secondary); display: block;">Max: 2MB</small>
                    </div>
                </div>
            </div>
            <div class="settings-section">
                <h2>Name</h2>
                <p class="help-text">Your name may appear around Vibifiy where you are mentioned.</p>
                <div class="form-group full-width">
                    <input type="text" id="editDisplayName" value="${profile.display_name || ''}" placeholder="Display Name">
                </div>
            </div>
            <div class="settings-section">
                <h2>Username</h2>
                <p class="help-text">This is your unique identifier on Vibifiy.</p>
                <div class="form-group full-width">
                    <input type="text" id="editUsername" value="${profile.username || ''}" placeholder="username">
                </div>
            </div>
            <div class="settings-section">
                <h2>Bio</h2>
                <p class="help-text">Tell us a little bit about yourself. You can use Markdown formatting.</p>
                <div class="form-group full-width">
                    <textarea id="editBio" rows="4" placeholder="Hi, I make awesome apps!">${profile.bio || ''}</textarea>
                </div>
            </div>
            <div class="settings-section">
                <h2>Social Links</h2>
                <div id="socialLinksContainer">
                    <div class="form-group full-width"><label>Website</label><input type="url" id="editWebsite" value="${profile.website || ''}" placeholder="https://yourwebsite.com"></div>
                    <div class="form-group full-width"><label>GitHub</label><input type="url" id="editGithub" value="${profile.github_url || ''}" placeholder="https://github.com/username"></div>
                    <div class="form-group full-width"><label>Twitter</label><input type="url" id="editTwitter" value="${profile.twitter_url || ''}" placeholder="https://twitter.com/username"></div>
                    <div class="form-group full-width"><label>LinkedIn</label><input type="url" id="editLinkedin" value="${profile.linkedin_url || ''}" placeholder="https://linkedin.com/in/username"></div>
                </div>
                <button type="button" class="btn-outline" onclick="addCustomSocialLink()" style="margin-top: 1rem;">+ Add Custom Social Link</button>
            </div>
            <div class="settings-section">
                <h2>README</h2>
                <p class="help-text">Add a README to your profile. You can use Markdown formatting.</p>
                <div class="form-group full-width">
                    <textarea id="editReadme" rows="8" placeholder="# Hi there!">${profile.readme || ''}</textarea>
                </div>
            </div>
            <div class="form-actions" style="flex-direction: column; align-items: stretch;">
                <button type="button" class="btn-primary" onclick="saveProfile()" style="margin-bottom: 0.5rem;">Save Changes</button>
                <p id="saveStatusMessage" style="text-align: center; color: var(--accent); font-weight: 600; opacity: 0; transition: opacity 0.3s; margin: 0.5rem 0;">Changes Saved!</p>
                <button type="button" class="btn-outline" onclick="navigateTo('profile')">Cancel</button>
            </div>
        `;
        
        // Re-attach file preview listeners
        document.getElementById('editAvatarFile')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Check file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('Profile photo must be less than 2MB. Your file is ' + (file.size / 1024 / 1024).toFixed(2) + 'MB');
                    e.target.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.getElementById('editProfileAvatar').innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                    // Remove delete button if exists
                    const deleteBtn = document.getElementById('deleteAvatarBtn');
                    if (deleteBtn) deleteBtn.remove();
                };
                reader.readAsDataURL(file);
            }
        });
        document.getElementById('editBannerFile')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Check file size (max 6MB)
                if (file.size > 6 * 1024 * 1024) {
                    alert('Banner image must be less than 6MB. Your file is ' + (file.size / 1024 / 1024).toFixed(2) + 'MB');
                    e.target.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.getElementById('editBannerPreview').innerHTML = `<img src="${event.target.result}" alt="Banner Preview">`;
                    // Remove delete button if exists
                    const deleteBtn = document.getElementById('deleteBannerBtn');
                    if (deleteBtn) deleteBtn.remove();
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Delete avatar button
        document.getElementById('deleteAvatarBtn')?.addEventListener('click', () => {
            showCustomDialog('Delete Profile Photo', 'Are you sure you want to delete your profile photo?', () => {
                document.getElementById('editProfileAvatar').innerHTML = (profile.display_name || 'A').charAt(0).toUpperCase();
                document.getElementById('editAvatarFile').value = '';
                window._deleteAvatar = true;
                // Don't auto-save, wait for user to click "Save Changes"
            });
        });
        
        // Delete banner button
        document.getElementById('deleteBannerBtn')?.addEventListener('click', () => {
            showCustomDialog('Delete Banner Image', 'Are you sure you want to delete your banner image?', () => {
                document.getElementById('editBannerPreview').innerHTML = '<span style="color: var(--text-secondary);">No banner</span>';
                document.getElementById('editBannerFile').value = '';
                window._deleteBanner = true;
                // Don't auto-save, wait for user to click "Save Changes"
            });
        });
    } else if (section === 'general') {
        content.innerHTML = `
            <h1 class="github-page-title">General Settings</h1>
            <div class="settings-section">
                <h2>Appearance</h2>
                <p class="help-text">Customize how Vibifiy looks to you.</p>
                <div class="form-group">
                    <label>Theme</label>
                    <select id="themeSelect" style="width: 100%; padding: 0.6rem; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary);">
                        <option value="dark">Dark (Pitch Black)</option>
                        <option value="light">Light</option>
                    </select>
                </div>
            </div>
            <div class="settings-section">
                <h2>Notifications</h2>
                <p class="help-text">Choose what notifications you receive.</p>
                <p style="color: var(--text-secondary);">Coming soon...</p>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-primary" onclick="saveGeneralSettings()">Save Changes</button>
            </div>
        `;
        document.getElementById('themeSelect').value = document.body.getAttribute('data-theme') || 'dark';
    } else if (section === 'posts') {
        content.innerHTML = `<h1 class="github-page-title">Your Posts</h1><div id="userPostsList" class="activity-list"><p class="empty-activity">Loading...</p></div>`;
        await loadUserPosts();
    } else if (section === 'reposts') {
        content.innerHTML = `<h1 class="github-page-title">Your Reposts</h1><div id="userRepostsList" class="activity-list"><p class="empty-activity">Loading...</p></div>`;
        await loadUserReposts();
    } else if (section === 'comments') {
        content.innerHTML = `<h1 class="github-page-title">Your Comments & Replies</h1><div id="userCommentsList" class="activity-list"><p class="empty-activity">Loading...</p></div>`;
        await loadUserComments();
    }
}

async function loadUserPosts() {
    const profile = await getOrCreateProfile();
    const { data, error } = await supabase.from('discussions').select('*').eq('user_id', profile.user_id).order('created_at', { ascending: false });
    const container = document.getElementById('userPostsList');
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="empty-activity">You haven\'t posted anything yet.</p>';
        return;
    }
    container.innerHTML = data.map(post => `
        <div class="activity-card">
            <div class="activity-card-header">
                <strong>${escapeHtml(post.title)}</strong>
                <span class="activity-card-date">${new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <div class="activity-card-content">${escapeHtml(post.content.substring(0, 200))}${post.content.length > 200 ? '...' : ''}</div>
        </div>
    `).join('');
}

async function loadUserReposts() {
    const container = document.getElementById('userRepostsList');
    container.innerHTML = '<p class="empty-activity">Reposts feature coming soon!</p>';
}

async function loadUserComments() {
    const container = document.getElementById('userCommentsList');
    container.innerHTML = '<p class="empty-activity">Comments feature coming soon!</p>';
}

async function saveGeneralSettings() {
    const theme = document.getElementById('themeSelect').value;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('vibifiy-theme', theme);
    document.getElementById('themeToggle').textContent = theme === 'dark' ? '☀️' : '🌙';
    alert('Settings saved!');
}

// Handle initial load and route changes
function handleRoute(hash) {
    if (!hash) {
        navigateTo('dashboard');
        return;
    }
    
    const parts = hash.split('/').filter(p => p);
    
    if (parts[0] === 'profile' && parts[1]) {
        navigateTo('user-profile', { username: parts[1] });
    } else if (parts[0] === 'settings' && parts[1]) {
        navigateTo('settings');
        setTimeout(() => loadSettingsSection(parts[1]), 100);
    } else if (parts[0] === 'settings') {
        navigateTo('settings');
    } else if (parts[0] === 'dashboard') {
        navigateTo('dashboard');
    } else if (parts[0] === 'download') {
        navigateTo('download');
    } else if (parts[0] === 'reviews') {
        navigateTo('reviews');
    } else if (parts[0] === 'bug') {
        navigateTo('bug');
    } else if (parts[0] === 'discussions') {
        navigateTo('discussions');
    } else if (parts[0] === 'profile') {
        navigateTo('profile');
    } else {
        navigateTo('dashboard');
    }
}

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
    handleRoute(window.location.hash.substring(1));
});

// Nav dropdown toggle
document.getElementById('navAvatar')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('navDropdown').classList.toggle('show');
});

document.addEventListener('click', () => {
    document.getElementById('navDropdown')?.classList.remove('show');
});

document.getElementById('dropdownProfile')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('profile');
    document.getElementById('navDropdown').classList.remove('show');
});

document.getElementById('dropdownLogout')?.addEventListener('click', (e) => {
    e.preventDefault();
    showCustomDialog('Logout', 'Clear your local session?', () => {
        localStorage.removeItem('vibifiy_user_id');
        localStorage.removeItem('vibifiy-theme');
        location.reload();
    });
});

// Sidebar link clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('sidebar-link')) {
        e.preventDefault();
        const section = e.target.dataset.section;
        if (section) loadSettingsSection(section);
    }
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.getAttribute('href').substring(1));
    });
});

// Add Custom Social Link
function addCustomSocialLink() {
    const container = document.getElementById('socialLinksContainer');
    const index = container.querySelectorAll('.custom-social').length + 1;
    const div = document.createElement('div');
    div.className = 'form-group full-width custom-social';
    div.innerHTML = `
        <label>Custom Link ${index}</label>
        <input type="url" class="custom-social-url" placeholder="https://...">
        <input type="text" class="custom-social-label" placeholder="Link label (e.g., Discord)" style="margin-top: 0.5rem;">
    `;
    container.appendChild(div);
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
    if (error) { container.innerHTML = '<p style="text-align: center; color: var(--error);">Error loading reviews.</p>'; return; }
    if (!reviews || reviews.length === 0) { container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No reviews yet. Be the first!</p>'; return; }

    container.innerHTML = reviews.map(review => {
        const date = new Date(review.created_at).toLocaleDateString();
        const starsStr = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        return `<div class="review-card"><div class="review-header"><h4>${escapeHtml(review.name)}</h4><span class="review-stars">${starsStr}</span></div><p class="review-text">${escapeHtml(review.text)}</p><span class="review-date">${date}</span></div>`;
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
    if (error) { alert('Error: ' + error.message); } 
    else {
        alert('Review saved to the cloud! ☁️');
        e.target.reset(); selectedRating = 0;
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
        title: bugTitle.value, description: bugDesc.value, severity: document.getElementById('bugSeverity').value
    }]);

    if (error) { alert('Error: ' + error.message); } 
    else { alert('Bug report saved to the cloud! 🐛'); e.target.reset(); }
    btn.innerText = originalText; btn.disabled = false;
});

// ============================================
// 7. SUPABASE: DISCUSSIONS
// ============================================
function getUserId() {
    let userId = localStorage.getItem('vibifiy_user_id');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('vibifiy_user_id', userId);
    }
    return userId;
}

async function fetchGitHubRepoData(url) {
    try {
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) return null;
        const [, owner, repo] = match;
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) { return null; }
}

async function uploadDiscussionImages(files, discussionId) {
    const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${discussionId}_${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from('discussion-images').upload(fileName, file, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('discussion-images').getPublicUrl(fileName);
        return { name: file.name, url: publicUrl };
    });
    return await Promise.all(uploadPromises);
}

async function createDiscussion(title, content, userName, githubLink, images = []) {
    const userId = getUserId();
    let imageData = [];
    if (images.length > 0) {
        const tempId = 'temp_' + Date.now();
        imageData = await uploadDiscussionImages(images, tempId);
    }
    const { data, error } = await supabase.from('discussions').insert([{ user_name: userName, user_id: userId, title, content, images: imageData, github_link: githubLink }]).select();
    if (error) throw error;
    return data[0];
}

async function loadDiscussions() {
    const { data, error } = await supabase.from('discussions').select('*, reposts (count), comments (count)').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

function renderGitHubCard(repoData) {
    if (!repoData) return '';
    return `<div class="github-link-card">
        <div class="github-card-header">
            <img src="${repoData.owner.avatar_url}" alt="${repoData.owner.login}" class="github-avatar">
            <div><h4>${repoData.name}</h4><p>${repoData.owner.login}</p></div>
        </div>
        <p class="github-description">${repoData.description || 'No description'}</p>
        <div class="github-stats"><span>⭐ ${repoData.stargazers_count}</span><span>🍴 ${repoData.forks_count}</span></div>
        <a href="${repoData.html_url}" target="_blank" class="github-link">View on GitHub ↗</a>
    </div>`;
}

function renderDiscussionPost(discussion) {
    const currentUserId = getUserId();
    const isOwner = discussion.user_id === currentUserId;
    const date = new Date(discussion.created_at).toLocaleDateString();
    
    let imagesHtml = '';
    if (discussion.images && discussion.images.length > 0) {
        imagesHtml = `<div class="discussion-images">${discussion.images.map(img => `<img src="${img.url}" alt="${img.name}" class="discussion-image">`).join('')}</div>`;
    }
    
    let githubCardHtml = '';
    if (discussion.github_link) {
        fetchGitHubRepoData(discussion.github_link).then(repoData => {
            if (repoData) {
                const cardContainer = document.querySelector(`[data-discussion-id="${discussion.id}"] .github-card-container`);
                if (cardContainer) cardContainer.innerHTML = renderGitHubCard(repoData);
            }
        });
        githubCardHtml = `<div class="github-card-container" data-discussion-id="${discussion.id}"><div class="loading-github">Loading GitHub preview...</div></div>`;
    }
    
    return `<article class="discussion-card" data-discussion-id="${discussion.id}">
        <div class="discussion-header">
            <div class="discussion-author">
                <div class="author-avatar">${discussion.user_name.charAt(0).toUpperCase()}</div>
                <div><h4>${escapeHtml(discussion.user_name)}</h4><span class="discussion-date">${date}</span></div>
            </div>
            ${isOwner ? `<div class="discussion-actions"><button class="btn-icon" onclick="deleteDiscussion('${discussion.id}')">🗑️</button></div>` : ''}
        </div>
        <h3 class="discussion-title">${escapeHtml(discussion.title)}</h3>
        <div class="discussion-content">${escapeHtml(discussion.content)}</div>
        ${imagesHtml}${githubCardHtml}
        <div class="discussion-footer">
            <button class="discussion-action-btn" onclick="repostDiscussion('${discussion.id}')">🔁 Repost</button>
            <button class="discussion-action-btn" onclick="toggleComments('${discussion.id}')">💬 Comments</button>
        </div>
        <div id="comments-${discussion.id}" class="comments-section" style="display: none;">
            <div class="comment-form">
                <input type="text" id="comment-name-${discussion.id}" placeholder="Your name">
                <textarea id="comment-text-${discussion.id}" placeholder="Write a comment..."></textarea>
                <button class="btn-primary" onclick="submitComment('${discussion.id}')">Post Comment</button>
            </div>
            <div id="comments-list-${discussion.id}" class="comments-list"></div>
        </div>
    </article>`;
}

async function initDiscussions() {
    const container = document.getElementById('discussionsList');
    if (!container) return;
    container.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading discussions...</p>';
    try {
        const discussions = await loadDiscussions();
        if (discussions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">No discussions yet. Be the first!</p>';
            return;
        }
        container.innerHTML = discussions.map(renderDiscussionPost).join('');
    } catch (error) {
        console.error('Error loading discussions:', error);
        container.innerHTML = '<p style="text-align: center; color: var(--error);">Error loading discussions.</p>';
    }
}

document.getElementById('submitDiscussionBtn')?.addEventListener('click', async () => {
    const title = document.getElementById('discussionTitle').value.trim();
    const content = document.getElementById('discussionContent').value.trim();
    const userName = document.getElementById('discussionUserName').value.trim();
    const githubLink = document.getElementById('discussionGitHubLink').value.trim();
    const imageInput = document.getElementById('discussionImages');
    
    if (!title || !content || !userName) { alert('Please fill in all required fields'); return; }
    
    const btn = document.getElementById('submitDiscussionBtn');
    btn.innerText = 'Posting...'; btn.disabled = true;
    
    try {
        await createDiscussion(title, content, userName, githubLink, imageInput.files);
        alert('Discussion posted!');
        document.getElementById('discussionTitle').value = '';
        document.getElementById('discussionContent').value = '';
        document.getElementById('discussionUserName').value = '';
        document.getElementById('discussionGitHubLink').value = '';
        imageInput.value = '';
        await initDiscussions();
    } catch (error) {
        alert('Error posting discussion: ' + error.message);
    } finally {
        btn.innerText = 'Post Discussion'; btn.disabled = false;
    }
});

// Placeholder functions for discussion actions (to prevent console errors)
window.deleteDiscussion = async (id) => {
    if (!confirm('Delete this discussion? This cannot be undone.')) return;
    
    try {
        // Remove from UI immediately for a smooth feel
        const element = document.querySelector(`[data-discussion-id="${id}"]`);
        if (element) {
            element.style.transition = 'all 0.3s ease';
            element.style.opacity = '0';
            element.style.transform = 'translateY(-20px)';
            element.style.pointerEvents = 'none';
        }
        
        // Delete from database
        const { error } = await supabase.from('discussions').delete().eq('id', id);
        
        if (error) {
            console.error('Delete error:', error);
            alert('Failed to delete. Check console for details.');
            // Revert UI if it failed
            if (element) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                element.style.pointerEvents = 'auto';
            }
        } else {
            // Fully remove from DOM after animation
            setTimeout(() => {
                if (element) element.remove();
                // Reload if it was the last one
                const remaining = document.querySelectorAll('.discussion-card');
                if (remaining.length === 0) initDiscussions();
            }, 300);
        }
    } catch (err) {
        console.error(err);
    }
};
window.repostDiscussion = (id) => alert('Repost feature coming soon!');
window.toggleComments = (id) => {
    const el = document.getElementById(`comments-${id}`);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
};
window.submitComment = (id) => alert('Comments feature coming soon!');

// ============================================
// 8. UTILS & INIT
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update nav avatar
async function updateNavAvatar() {
    try {
        const profile = await getOrCreateProfile();
        const letter = document.getElementById('navAvatarLetter');
        const img = document.getElementById('navAvatarImg');
        
        if (!letter || !img) return;
        
        if (profile.avatar_url) {
            img.src = profile.avatar_url;
            img.style.display = 'block';
            letter.style.display = 'none';
        } else {
            const displayName = profile.display_name || 'User';
            letter.textContent = displayName.charAt(0).toUpperCase();
            img.style.display = 'none';
            letter.style.display = 'block';
        }
    } catch (error) {
        console.error('Error updating nav avatar:', error);
        const letter = document.getElementById('navAvatarLetter');
        if (letter) letter.textContent = 'U';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderDownloads();
    renderDashboard();
    setTimeout(() => {
        updateNavAvatar();
    }, 500);
    const hash = window.location.hash.substring(1);
    handleRoute(hash);
});

// ============================================
// 9. PROFILE SYSTEM
// ============================================

async function getOrCreateProfile() {
    const userId = getUserId();
    
    // Try to fetch existing profile
    const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (existing) return existing;
    
    // Create new profile with default values
    const defaultUsername = 'user_' + Math.random().toString(36).substr(2, 6);
    const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert([{
            user_id: userId,
            username: defaultUsername,
            display_name: 'Anonymous User'
        }])
        .select()
        .single();
    
    if (error) throw error;
    return newProfile;
}

async function loadProfile() {
    const profile = await getOrCreateProfile();
    
    // Update profile page
    document.getElementById('profileDisplayName').textContent = profile.display_name || 'Anonymous';
    document.getElementById('profileUsername').querySelector('span').textContent = profile.username;
    
    // Handle avatar - show image if exists, otherwise show letter
    const avatarEl = document.getElementById('profileAvatar');
    if (profile.avatar_url) {
        avatarEl.innerHTML = `<img src="${profile.avatar_url}" alt="${profile.display_name}">`;
    } else {
        avatarEl.innerHTML = (profile.display_name || 'A').charAt(0).toUpperCase();
    }
    
    // Handle banner - show image if exists, otherwise gradient
    const bannerEl = document.getElementById('profileBanner');
    if (profile.banner_url) {
        bannerEl.style.backgroundImage = `url(${profile.banner_url})`;
    } else {
        bannerEl.style.backgroundImage = '';
    }
    
    // Load social links
    const linksContainer = document.getElementById('profileLinks').querySelector('.links-grid');
    linksContainer.innerHTML = '';
    let hasLinks = false;
    
    if (profile.website) {
        linksContainer.innerHTML += `<a href="${profile.website}" target="_blank" class="profile-link">🌐 Website</a>`;
        hasLinks = true;
    }
    if (profile.github_url) {
        linksContainer.innerHTML += `<a href="${profile.github_url}" target="_blank" class="profile-link"> GitHub</a>`;
        hasLinks = true;
    }
    if (profile.twitter_url) {
        linksContainer.innerHTML += `<a href="${profile.twitter_url}" target="_blank" class="profile-link">🐦 Twitter</a>`;
        hasLinks = true;
    }
    if (profile.linkedin_url) {
        linksContainer.innerHTML += `<a href="${profile.linkedin_url}" target="_blank" class="profile-link">💼 LinkedIn</a>`;
        hasLinks = true;
    }
    
    if (hasLinks) {
        document.getElementById('profileLinks').style.display = 'block';
    } else {
        document.getElementById('profileLinks').style.display = 'none';
    }
    
    // Load README
    const readmeContent = document.getElementById('readmeContent');
    if (profile.readme) {
        readmeContent.innerHTML = renderMarkdown(profile.readme);
    } else {
        readmeContent.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No README yet. Click the edit button to add one!</p>';
    }
    
    // Load user's posts count
    const { count } = await supabase
        .from('discussions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.user_id);
    
    document.getElementById('statPosts').textContent = count || 0;
    
    return profile;
}

// Enhanced markdown renderer
function renderMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>')
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
}

// Edit profile - GitHub style (navigate to settings)
document.getElementById('editProfileBtn')?.addEventListener('click', async () => {
    navigateTo('settings');
});

// Upload profile image helper
async function uploadProfileImage(file, type) {
    const userId = getUserId();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${type}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);
    
    return publicUrl;
}


// Load profile edit page
async function loadProfileEdit() {
    const profile = await getOrCreateProfile();
    
    // Update avatar preview
    const avatarEl = document.getElementById('editProfileAvatar');
    if (profile.avatar_url) {
        avatarEl.innerHTML = `<img src="${profile.avatar_url}" alt="${profile.display_name}">`;
    } else {
        avatarEl.innerHTML = (profile.display_name || 'A').charAt(0).toUpperCase();
    }
    
    // Update banner preview
    const bannerPreview = document.getElementById('editBannerPreview');
    if (profile.banner_url) {
        bannerPreview.innerHTML = `<img src="${profile.banner_url}" alt="Banner" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        bannerPreview.innerHTML = `<span style="color: var(--text-secondary);">No banner</span>`;
    }
    
    // Load form fields
    document.getElementById('editDisplayName').value = profile.display_name || '';
    document.getElementById('editUsername').value = profile.username || '';
    document.getElementById('editBio').value = profile.bio || '';
    document.getElementById('editPublicEmail').value = profile.public_email || '';
    document.getElementById('editWebsite').value = profile.website || '';
    document.getElementById('editGithub').value = profile.github_url || '';
    document.getElementById('editTwitter').value = profile.twitter_url || '';
    document.getElementById('editLinkedin').value = profile.linkedin_url || '';
    document.getElementById('editReadme').value = profile.readme || '';
    
    // Reset file inputs
    document.getElementById('editAvatarFile').value = '';
    document.getElementById('editBannerFile').value = '';
}

// Preview uploaded files
document.getElementById('editAvatarFile')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('editProfileAvatar').innerHTML = `<img src="${event.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('editBannerFile')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 6MB like YouTube)
    if (file.size > 6 * 1024 * 1024) {
        alert('Banner image must be less than 6MB. Your file is ' + (file.size / 1024 / 1024).toFixed(2) + 'MB');
        e.target.value = '';
        return;
    }
    
    // Check image dimensions
    const img = new Image();
    img.onload = function() {
        const width = this.width;
        const height = this.height;
        
        // YouTube banner recommended: 2560 x 1440 (16:9)
        // Minimum safe area: 1546 x 423
        if (width < 1546 || height < 423) {
            alert(`Banner image is too small. Minimum size is 1546 x 423 pixels (safe area). Your image is ${width} x ${height}px.\n\nRecommended size: 2560 x 1440 pixels (16:9 aspect ratio)`);
            e.target.value = '';
            return;
        }
        
        // Show preview if valid
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('editBannerPreview').innerHTML = `<img src="${event.target.result}" alt="Banner Preview" style="width: 100%; height: 100%; object-fit: cover;">`;
        };
        reader.readAsDataURL(file);
    };
    
    img.onerror = function() {
        alert('Invalid image file. Please upload a valid image.');
        e.target.value = '';
    };
    
    img.src = URL.createObjectURL(file);
});

// Save profile function
async function saveProfile() {
    // Show confirmation dialog first
    showCustomDialog('Confirm Save', 'Are you sure you want to save the changes to your account?', async () => {
        const userId = getUserId();
        const saveBtn = document.querySelector('.form-actions .btn-primary');
        const statusMsg = document.getElementById('saveStatusMessage');
        
        // Disable button and show loading
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
        }
        
        const updates = {
            display_name: document.getElementById('editDisplayName').value,
            username: document.getElementById('editUsername').value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
            bio: document.getElementById('editBio').value,
            website: document.getElementById('editWebsite').value,
            github_url: document.getElementById('editGithub').value,
            twitter_url: document.getElementById('editTwitter').value,
            linkedin_url: document.getElementById('editLinkedin').value,
            readme: document.getElementById('editReadme').value,
            updated_at: new Date().toISOString()
        };
        
        // Handle avatar deletion
        if (window._deleteAvatar) {
            updates.avatar_url = null;
            window._deleteAvatar = false;
        }
        
        // Handle banner deletion
        if (window._deleteBanner) {
            updates.banner_url = null;
            window._deleteBanner = false;
        }
        
        // Upload avatar if file selected
        const avatarFile = document.getElementById('editAvatarFile').files[0];
        if (avatarFile) {
            try {
                const avatarUrl = await uploadProfileImage(avatarFile, 'avatar');
                updates.avatar_url = avatarUrl;
            } catch (err) {
                showCustomDialog('Upload Error', 'Error uploading avatar: ' + err.message);
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save Changes';
                }
                return;
            }
        }
        
        // Upload banner if file selected
        const bannerFile = document.getElementById('editBannerFile').files[0];
        if (bannerFile) {
            try {
                const bannerUrl = await uploadProfileImage(bannerFile, 'banner');
                updates.banner_url = bannerUrl;
            } catch (err) {
                showCustomDialog('Upload Error', 'Error uploading banner: ' + err.message);
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save Changes';
                }
                return;
            }
        }
        
        // Collect custom social links
        const customSocials = [];
        document.querySelectorAll('.custom-social').forEach(el => {
            const url = el.querySelector('.custom-social-url').value;
            const label = el.querySelector('.custom-social-label').value;
            if (url && label) customSocials.push({ url, label });
        });
        if (customSocials.length > 0) {
            updates.custom_social_links = JSON.stringify(customSocials);
        }
        
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('user_id', userId);
        
        if (error) {
            showCustomDialog('Error', 'Error saving profile: ' + error.message);
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Changes';
            }
        } else {
            // Show success message
            if (statusMsg) {
                statusMsg.textContent = 'Changes Saved!';
                statusMsg.style.opacity = '1';
            }
            
            // Re-enable button after delay
            setTimeout(() => {
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save Changes';
                }
                if (statusMsg) {
                    statusMsg.style.opacity = '0';
                }
            }, 3000);
            
            updateNavAvatar();
        }
    });
}

// Expose to window for inline onclick handlers (ES modules don't expose by default)
window.saveProfile = saveProfile;
window.addCustomSocialLink = addCustomSocialLink;
window.closeCustomDialog = closeCustomDialog;

// README Editor
document.getElementById('editReadmeBtn')?.addEventListener('click', async () => {
    const profile = await getOrCreateProfile();
    const readmeContent = document.getElementById('readmeContent');
    
    // Switch to edit mode
    readmeContent.innerHTML = `
        <textarea id="readmeEditor" placeholder="Write your README in Markdown...">${profile.readme || ''}</textarea>
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button class="btn-primary" id="saveReadmeBtn" style="width: auto;">Save README</button>
            <button class="btn-secondary" id="cancelReadmeBtn" style="width: auto;">Cancel</button>
        </div>
    `;
    
    document.getElementById('saveReadmeBtn').addEventListener('click', async () => {
        const newReadme = document.getElementById('readmeEditor').value;
        const { error } = await supabase
            .from('profiles')
            .update({ readme: newReadme, updated_at: new Date().toISOString() })
            .eq('user_id', profile.user_id);
        
        if (error) {
            alert('Error saving README: ' + error.message);
        } else {
            alert('README saved!');
            loadProfile();
        }
    });
    
    document.getElementById('cancelReadmeBtn').addEventListener('click', () => {
        loadProfile();
    });
});

// Make sure there is NO second navigateTo function below this point