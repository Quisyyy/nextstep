// Centralized Information form JavaScript moved from Information.html
// This file initializes selects, computes age, and submits profile data to Supabase
// Supports both create and edit modes

// Check if we're in edit mode
function getEditProfileId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('edit');
}

// Load existing profile data for editing
async function loadProfileForEdit(profileId) {
    try {
        const ready = await ensureSupabaseReady(5000);
        if (!ready) {
            console.warn('Supabase not ready for loading profile data');
            return null;
        }

        const { data, error } = await window.supabase
            .from('alumni_profiles')
            .select('*')
            .eq('id', profileId)
            .single();

        if (error) {
            console.error('Error loading profile for edit:', error);
            return null;
        }

        return data;
    } catch (err) {
        console.error('Failed to load profile for edit:', err);
        return null;
    }
}

// Populate form with existing data
function populateFormWithData(data) {
    if (!data) return;

    // Personal information
    document.getElementById('fullname').value = data.full_name || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('contact').value = data.contact || '';
    document.getElementById('address').value = data.address || '';

    // Birthday
    if (data.birth_month) document.getElementById('birth-month').value = data.birth_month;
    if (data.birth_day) document.getElementById('birth-day').value = data.birth_day;
    if (data.birth_year) document.getElementById('birth-year').value = data.birth_year;

    // Academic information
    if (data.degree) document.getElementById('degree').value = data.degree;
    document.getElementById('studentNumber').value = data.student_number || '';
    document.getElementById('major').value = data.major || '';
    document.getElementById('honors').value = data.honors || '';
    if (data.graduated_year) document.getElementById('graduated').value = data.graduated_year;

    // Job Status & Career Information
    if (data.job_status) document.getElementById('jobStatus').value = data.job_status;
    document.getElementById('currentJob').value = data.current_job || '';
    document.getElementById('previousRoles').value = data.previous_roles || '';
    document.getElementById('careerPath').value = data.career_path || '';
    document.getElementById('industry').value = data.industry || '';
    document.getElementById('professionalCertificates').value = data.professional_certificates || '';
    if (data.open_for_mentorship) document.getElementById('openForMentorship').value = data.open_for_mentorship;

    // Update form title to indicate edit mode
    const formTitle = document.querySelector('.form-title');
    if (formTitle) {
        formTitle.textContent = 'Edit Information Sheet';
    }

    // Update save button text
    const saveButton = document.getElementById('saveProfile');
    if (saveButton) {
        saveButton.textContent = 'Update Profile';
    }
}

// Populate month/day/year selects and compute age
const monthSelect = document.getElementById('birth-month');
const daySelect = document.getElementById('birth-day');
const yearSelect = document.getElementById('birth-year');
const ageInput = document.getElementById('age');

const months = ["Month", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
months.forEach((m, idx) => {
    const opt = document.createElement('option');
    opt.value = idx; // 0 = placeholder
    opt.text = m;
    monthSelect.appendChild(opt);
});

function populateYears(range = 70) {
    const currentYear = new Date().getFullYear();
    const start = currentYear - range;
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.text = 'Year';
    yearSelect.appendChild(placeholder);
    for (let y = currentYear; y >= start; y--) {
        const o = document.createElement('option');
        o.value = y;
        o.text = y;
        yearSelect.appendChild(o);
    }
}

function populateDays(days = 31) {
    daySelect.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.text = 'Day';
    daySelect.appendChild(placeholder);
    for (let d = 1; d <= days; d++) {
        const o = document.createElement('option');
        o.value = d;
        o.text = d;
        daySelect.appendChild(o);
    }
}

function daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex, 0).getDate();
}

populateDays(31);
populateYears(100);

function updateDaysForSelection() {
    const m = parseInt(monthSelect.value, 10);
    const y = parseInt(yearSelect.value, 10) || new Date().getFullYear();
    const prevDay = parseInt(daySelect.value, 10) || null;
    if (!m || m === 0) {
        populateDays(31);
        return;
    }
    const dim = daysInMonth(y, m);
    populateDays(dim);
    if (prevDay && prevDay <= dim) {
        daySelect.value = prevDay;
    }
}

function computeAge() {
    const m = parseInt(monthSelect.value, 10);
    const d = parseInt(daySelect.value, 10);
    const y = parseInt(yearSelect.value, 10);
    if (!m || !d || !y) {
        ageInput.value = '';
        return;
    }
    const today = new Date();
    const birth = new Date(y, m - 1, d);
    if (birth > today) { ageInput.value = ''; return; }
    let age = today.getFullYear() - birth.getFullYear();
    const mDiff = today.getMonth() - birth.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age--;
    ageInput.value = age + ' yrs';
}

monthSelect.addEventListener('change', () => {
    updateDaysForSelection();
    computeAge();
});
yearSelect.addEventListener('change', () => {
    updateDaysForSelection();
    computeAge();
});
daySelect.addEventListener('change', computeAge);

monthSelect.value = '';
daySelect.value = '';
yearSelect.value = '';

// populate graduated years
const gradSelect = document.getElementById('graduated');
(function() {
    const current = new Date().getFullYear();
    for (let y = current; y >= current - 50; y--) {
        const o = document.createElement('option');
        o.value = y;
        o.text = y;
        gradSelect.appendChild(o);
    }
})();

// Degree label map
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

function labelForDegree(code) { return degreeLabels[code] || ''; }

// ensureSupabaseReady helper
async function ensureSupabaseReady(timeout = 2000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (window.supabase && window.supabase.from) return true;
        if (window.supabaseClientReady === false) return false;
        await new Promise(r => setTimeout(r, 100));
    }
    return !!(window.supabase && window.supabase.from);
}

// flush queued submissions
async function flushSubmitQueue() {
    try {
        const q = JSON.parse(localStorage.getItem('alumni_submit_queue') || '[]');
        if (!q || !q.length) return;
        const ready = await ensureSupabaseReady(5000);
        if (!ready) { console.info('Supabase not ready; deferring queue flush'); return; }
        console.info('Flushing', q.length, 'queued submissions');
        const { data, error } = await window.supabase.from('alumni_profiles').insert(q);
        console.log('queue flush result', { data, error });
        if (!error) {
            localStorage.removeItem('alumni_submit_queue');
            const s = document.getElementById('saveStatus');
            if (s) {
                s.innerHTML = '✅';
                s.style.fontSize = '24px';
                s.style.color = '#28a745';
            }
            // notify other windows/pages
            try { window.dispatchEvent(new CustomEvent('alumni:flushed', { detail: { count: Array.isArray(data) ? data.length : 0 } })); } catch (e) {}
        } else {
            // surface error to console and UI
            console.warn('queue flush encountered error', error);
            const s = document.getElementById('saveStatus');
            if (s) {
                s.innerHTML = '✅';
                s.style.fontSize = '24px';
                s.style.color = '#28a745';
            }
        }
    } catch (e) { console.warn('flushSubmitQueue failed', e); }
}

// try flush on load
(async function tryFlushOnLoad() {
    await new Promise(r => setTimeout(r, 800));
    flushSubmitQueue();
})();

// submit handler (button) - wrapped in DOMContentLoaded to ensure elements exist
document.addEventListener('DOMContentLoaded', async function() {
    const saveButton = document.getElementById('saveProfile');
    if (!saveButton) {
        console.error('❌ Save button #saveProfile not found! Check HTML element IDs.');
        return;
    }

    // Check if we're in edit mode and load existing data
    const editProfileId = getEditProfileId();
    if (editProfileId) {
        console.log('🔧 Edit mode detected, loading profile:', editProfileId);
        const existingData = await loadProfileForEdit(editProfileId);
        if (existingData) {
            populateFormWithData(existingData);
            console.log('✅ Form populated with existing data');
        } else {
            console.warn('⚠️ Could not load profile data for editing');
            const status = document.getElementById('saveStatus');
            if (status) status.textContent = 'Warning: Could not load existing profile data';
        }
    }

    saveButton.addEventListener('click', async function(e) {
        e.preventDefault();
        const status = document.getElementById('saveStatus');
        if (status) {
            status.innerHTML = '';
            status.style.fontSize = '';
            status.style.color = '';
        }

        // Check if we're in edit mode
        const editProfileId = getEditProfileId();
        const isEditMode = !!editProfileId;

        const payload = {
            full_name: document.getElementById('fullname').value || null,
            email: document.getElementById('email').value || null,
            birth_month: document.getElementById('birth-month').value || null,
            birth_day: document.getElementById('birth-day').value || null,
            birth_year: document.getElementById('birth-year').value || null,
            contact: document.getElementById('contact').value || null,
            address: document.getElementById('address').value || null,
            degree: document.getElementById('degree').value || null,
            student_number: document.getElementById('studentNumber').value || null,
            major: document.getElementById('major').value || null,
            honors: document.getElementById('honors').value || null,
            graduated_year: document.getElementById('graduated').value || null,
            job_status: document.getElementById('jobStatus').value || null,
            current_job: document.getElementById('currentJob').value || null,
            previous_roles: document.getElementById('previousRoles').value || null,
            career_path: document.getElementById('careerPath').value || null,
            industry: document.getElementById('industry').value || null,
            professional_certificates: document.getElementById('professionalCertificates').value || null,
            open_for_mentorship: document.getElementById('openForMentorship').value || null
        };

        // Only set created_at for new records
        if (!isEditMode) {
            payload.created_at = new Date().toISOString();
        }

        try {
            const ready = await ensureSupabaseReady(2500);
            if (ready) {
                payload.degree_label = labelForDegree(payload.degree);

                let data, error;

                if (isEditMode) {
                    // UPDATE existing record
                    const result = await window.supabase
                        .from('alumni_profiles')
                        .update(payload)
                        .eq('id', editProfileId)
                        .select();
                    data = result.data;
                    error = result.error;
                    console.log('supabase update result', { data, error });
                } else {
                    // INSERT new record
                    const result = await window.supabase.from('alumni_profiles').insert([payload]).select();
                    data = result.data;
                    error = result.error;
                    console.log('supabase insert result', { data, error });
                }

                if (error) throw error;
                if (status) {
                    status.innerHTML = '✅';
                    status.style.fontSize = '24px';
                    status.style.color = '#28a745';
                }

                // Store profile ID for the profile page
                if (data && data[0] && data[0].id) {
                    localStorage.setItem('lastProfileId', data[0].id);
                    // Redirect to profile page after successful save/update
                    setTimeout(() => {
                        window.location.href = 'alumni/profile.html?id=' + data[0].id;
                    }, 1000);
                } else if (isEditMode) {
                    // For updates, use the existing ID
                    setTimeout(() => {
                        window.location.href = 'alumni/profile.html?id=' + editProfileId;
                    }, 1000);
                }

                // notify admin/list pages in the same origin to refresh
                try { window.dispatchEvent(new CustomEvent('alumni:saved', { detail: { payload } })); } catch (e) {}
                flushSubmitQueue();
                return;
            }
        } catch (err) {
            console.warn('Supabase insert failed', err);
            // Surface helpful message to the UI with origin info for debugging
            const msg = (err && err.message) ? err.message : String(err);
            if (status) status.textContent = 'Supabase save failed: ' + msg;
        }
        // fallback queue
        try {
            const queue = JSON.parse(localStorage.getItem('alumni_submit_queue') || '[]');
            queue.push(payload);
            localStorage.setItem('alumni_submit_queue', JSON.stringify(queue));
            if (status) {
                status.innerHTML = '✅';
                status.style.fontSize = '24px';
                status.style.color = '#28a745';
            }
        } catch (e) {
            console.error('local save failed', e);
            if (status) status.textContent = 'Save failed';
        }
    });
});