// Centralized Information form JavaScript moved from alumni/Information.html
// This file initializes selects, computes age, and submits profile data to Supabase

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
    if (!m || m === 0) {
        populateDays(31);
        return;
    }
    const dim = daysInMonth(y, m);
    populateDays(dim);
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
            if (s) s.textContent = 'Flushed offline submissions to Supabase ✅';
            // notify other windows/pages
            try { window.dispatchEvent(new CustomEvent('alumni:flushed', { detail: { count: Array.isArray(data) ? data.length : 0 } })); } catch (e) {}
        } else {
            // surface error to console and UI
            console.warn('queue flush encountered error', error);
            const s = document.getElementById('saveStatus');
            if (s) s.textContent = 'Flush failed — see console';
        }
    } catch (e) { console.warn('flushSubmitQueue failed', e); }
}

// try flush on load
(async function tryFlushOnLoad() {
    await new Promise(r => setTimeout(r, 800));
    flushSubmitQueue();
})();

// submit handler (button)
document.getElementById('saveProfile').addEventListener('click', async function(e) {
    e.preventDefault();
    const status = document.getElementById('saveStatus');
    status.textContent = 'Saving...';
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
        created_at: new Date().toISOString()
    };
    try {
        const ready = await ensureSupabaseReady(2500);
        if (ready) {
            payload.degree_label = labelForDegree(payload.degree);
            const { data, error } = await window.supabase.from('alumni_profiles').insert([payload]);
            console.log('supabase insert result', { data, error });
            if (error) throw error;
            status.textContent = 'Saved to Supabase ✅';
            // notify admin/list pages in the same origin to refresh
            try { window.dispatchEvent(new CustomEvent('alumni:saved', { detail: { payload } })); } catch (e) {}
            flushSubmitQueue();
            return;
        }
    } catch (err) {
        console.warn('Supabase insert failed', err);
        // Surface helpful message to the UI with origin info for debugging
        const msg = (err && err.message) ? err.message : String(err);
        status.textContent = 'Supabase save failed: ' + msg;
    }
    // fallback queue
    try {
        const queue = JSON.parse(localStorage.getItem('alumni_submit_queue') || '[]');
        queue.push(payload);
        localStorage.setItem('alumni_submit_queue', JSON.stringify(queue));
        status.textContent = 'Saved locally (offline) ✅';
    } catch (e) {
        console.error('local save failed', e);
        status.textContent = 'Save failed';
    }
});