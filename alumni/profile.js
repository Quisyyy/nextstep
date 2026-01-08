// Profile page JavaScript functionality
// Handles loading and displaying alumni profile information from Supabase

// Wait for Supabase to be ready
async function ensureSupabaseReady(timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (window.supabase && window.supabaseClientReady) return true;
        await new Promise(r => setTimeout(r, 100));
    }
    return false;
}

// Degree label mapping
const degreeLabels = {
    'BSA': 'Bachelor of Science in Accountancy (BSA)',
    'BSCpE': 'Bachelor of Science in Computer Engineering (BSCpE)',
    'BSENTREP': 'Bachelor of Science in Entrepreneurship (BSENTREP)',
    'BSHM': 'Bachelor of Science in Hospitality Management (BSHM)',
    'BSIT': 'Bachelor of Science in Information Technology (BSIT)',
    'BSEDEN': 'Bachelor of Secondary Education major in English (BSEDEN)',
    'BSEDMT': 'Bachelor of Secondary Education major in Mathematics (BSEDMT)',
    'DOMTLOM': 'Diploma in Office Management Technology- Legal Office Management (DOMTLOM)'
};

// Format birthday from separate fields
function formatBirthday(month, day, year) {
    if (!month || !day || !year) return '-';
    const monthNames = ["", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return `${monthNames[parseInt(month)] || month} ${day}, ${year}`;
}

// Calculate age from birthday
function calculateAge(month, day, year) {
    if (!month || !day || !year) return '-';
    const today = new Date();
    const birth = new Date(year, month - 1, day);
    if (birth > today) return '-';
    let age = today.getFullYear() - birth.getFullYear();
    const mDiff = today.getMonth() - birth.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age + ' years old';
}

// Read profile id from URL
function getProfileIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Fetch a single profile by id
async function fetchProfileById(id) {
    const { data, error } = await window.supabase
        .from('alumni_profiles')
        .select('*')
        .eq('id', id)
        .limit(1)
        .maybeSingle();
    return { data, error };
}

// Fetch latest profile by email
async function fetchLatestProfileByEmail(email) {
    const { data, error } = await window.supabase
        .from('alumni_profiles')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1);
    return { data: data && data[0] ? data[0] : null, error };
}

// Load and display profile bound to logged-in email only (no global fallback)
async function loadProfile() {
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const contentDiv = document.getElementById('profileContent');

    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    contentDiv.style.display = 'none';

    const currentEmail = (localStorage.getItem('currentUserEmail') || '').trim().toLowerCase();
    const urlProfileId = getProfileIdFromUrl();
    const storedProfileId = localStorage.getItem('lastProfileId');

    try {
        const ready = await ensureSupabaseReady();
        if (!ready) throw new Error('Database connection not available');

        let profile = null;
        let queryError = null;

        if (urlProfileId) {
            ({ data: profile, error: queryError } = await fetchProfileById(urlProfileId));
        } else if (currentEmail) {
            ({ data: profile, error: queryError } = await fetchLatestProfileByEmail(currentEmail));
        } else if (storedProfileId) {
            ({ data: profile, error: queryError } = await fetchProfileById(storedProfileId));
        }

        if (queryError) throw queryError;

        if (!profile) {
            // No profile yet – show empty template with guidance
            initializeEmptyProfile(currentEmail);
            return;
        }

        // Cache the id so we can revisit without URL param
        if (profile.id) localStorage.setItem('lastProfileId', profile.id);

        displayProfile(profile);
    } catch (err) {
        console.error('Error loading profile:', err);
        loadingDiv.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.querySelector('div').textContent = err.message || 'Unable to load profile.';
    }
}

// Initialize empty profile view when user has no record yet
function initializeEmptyProfile(email) {
    const loadingDiv = document.getElementById('loading');
    const contentDiv = document.getElementById('profileContent');
    const errorDiv = document.getElementById('error');
    loadingDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    contentDiv.style.display = 'block';

    // Clear / set placeholder header
    document.getElementById('avatar').textContent = (email ? email.charAt(0) : '?').toUpperCase();
    document.getElementById('profileName').textContent = 'No profile yet';
    document.getElementById('profileDegree').textContent = 'Fill out your Information Sheet';
    document.getElementById('joinDate').textContent = '-';

    // Ensure all detail fields are dashes
    const fieldIds = ['fullName', 'email', 'contact', 'address', 'birthday', 'age', 'degree', 'studentNumber', 'major', 'honors', 'graduated'];
    fieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = id === 'email' ? (email || '-') : '-';
    });

    // Edit button just opens blank Information form (no edit param)
    const editButton = document.querySelector('a.btn-edit');
    if (editButton) editButton.href = 'Information.html';
}

// Display profile data in the UI
function displayProfile(data) {
    const loadingDiv = document.getElementById('loading');
    const contentDiv = document.getElementById('profileContent');

    // Hide loading, show content
    loadingDiv.style.display = 'none';
    contentDiv.style.display = 'block';

    // Avatar (first letter of name)
    const avatar = document.getElementById('avatar');
    const nameParts = (data.full_name || '').split(',');
    const firstName = nameParts[1] ? nameParts[1].trim() : (data.full_name || '').charAt(0) || '?';
    avatar.textContent = firstName.charAt(0).toUpperCase();

    // Header info
    document.getElementById('profileName').textContent = data.full_name || 'Unknown';
    document.getElementById('profileDegree').textContent = data.degree_label || degreeLabels[data.degree] || data.degree || 'Not specified';

    // Join date
    const joinDate = new Date(data.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
        document.getElementById('joinDate').textContent = joinDate || '-';

    // Personal information
    document.getElementById('fullName').textContent = data.full_name || '-';
    document.getElementById('email').textContent = data.email || '-';
    document.getElementById('contact').textContent = data.contact || '-';
    document.getElementById('address').textContent = data.address || '-';
    document.getElementById('birthday').textContent = formatBirthday(data.birth_month, data.birth_day, data.birth_year);
    document.getElementById('age').textContent = calculateAge(data.birth_month, data.birth_day, data.birth_year);

    // Academic information
    document.getElementById('degree').textContent = data.degree_label || degreeLabels[data.degree] || data.degree || '-';
    document.getElementById('studentNumber').textContent = data.student_number || '-';
    document.getElementById('major').textContent = data.major || '-';
    document.getElementById('honors').textContent = data.honors || '-';
    document.getElementById('graduated').textContent = data.graduated_year || '-';

    // Update edit button to include profile ID for editing
    const editButton = document.querySelector('a.btn-edit');
    if (editButton && data.id) {
        const editUrl = `../Information.html?edit=${data.id}`;
        editButton.href = editUrl;
        console.log('✅ Edit button URL set to:', editUrl);
        console.log('Profile ID:', data.id);
    } else {
        console.warn('⚠️ Edit button setup failed');
        console.log('Edit button element:', editButton);
        console.log('Profile ID:', data.id);
    }
}

function initAuthNav() {
    const email = (localStorage.getItem('currentUserEmail') || '').trim().toLowerCase();
    const loginLink = document.getElementById('nav-login');
    const logoutBtn = document.getElementById('nav-logout');
    if (email) {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showLogoutConfirm('../login.html');
        });
    }
}

// Listen for profile updates from the Information page
window.addEventListener('alumni:saved', function(e) {
    console.log('Profile updated, reloading...');
    // Small delay to ensure database is updated
    setTimeout(() => loadProfile(), 500);
});

// Check if we're returning from an edit (shows success message)
function checkForUpdateSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('updated') === 'true') {
        // Show success message briefly
        const successMsg = document.createElement('div');
        successMsg.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #28a745; color: white; padding: 15px 30px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 8px rgba(0,0,0,0.2);';
        successMsg.textContent = '✅ Profile updated successfully!';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
        
        // Clean up URL without reload
        const cleanUrl = window.location.pathname + (urlParams.get('id') ? '?id=' + urlParams.get('id') : '');
        window.history.replaceState({}, document.title, cleanUrl);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initAuthNav();
    checkForUpdateSuccess();
    loadProfile();
});