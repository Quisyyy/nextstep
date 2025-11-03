// Signup page JS: submits signups to Supabase `signups` table.

async function ensureSupabaseReady(timeout = 3000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (window.supabase && typeof window.supabase.from === 'function') return true;
        if (window.supabaseClientReady === false) return false;
        await new Promise(r => setTimeout(r, 100));
    }
    return !!(window.supabase && typeof window.supabase.from === 'function');
}

async function flushSignupQueue() {
    try {
        const q = JSON.parse(localStorage.getItem('signup_queue') || '[]');
        if (!q || !q.length) return;
        const ready = await ensureSupabaseReady(5000);
        if (!ready) return;
        console.info('Flushing', q.length, 'signup queue items');
        const { data, error } = await window.supabase.from('signups').insert(q);
        console.log('signup queue flush', { data, error });
        if (!error) {
            localStorage.removeItem('signup_queue');
            const s = document.getElementById('signupStatus');
            if (s) s.textContent = 'Flushed offline signups to Supabase ✅';
            try { window.dispatchEvent(new CustomEvent('signup:flushed', { detail: { count: Array.isArray(data) ? data.length : 0 } })); } catch (e) {}
        }
    } catch (e) { console.warn('flushSignupQueue failed', e); }
}

(async function tryFlush() { await new Promise(r => setTimeout(r, 800));
    flushSignupQueue(); })();

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    const status = document.getElementById('signupStatus');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (status) status.textContent = 'Saving...';

        const full_name = (document.getElementById('signupName') || {}).value || null;
        const email = (document.getElementById('signupEmail') || {}).value || null;
        const phone = (document.getElementById('signupPhone') || {}).value || null;
        const pwd = (document.getElementById('signupPassword') || {}).value || '';
        const confirm = (document.getElementById('signupConfirm') || {}).value || '';

        if (!email || !full_name) {
            if (status) status.textContent = 'Please enter full name and email';
            return;
        }
        if (pwd !== confirm) {
            if (status) status.textContent = 'Passwords do not match';
            return;
        }

        // NOTE: We do NOT store plaintext passwords here. For production use Supabase Auth.
        const payload = {
            full_name,
            email,
            phone,
            role: 'student',
            confirmed: false,
            created_at: new Date().toISOString()
        };

        try {
            const ready = await ensureSupabaseReady(2500);
            if (ready) {
                const { data, error } = await window.supabase.from('signups').insert([payload]);
                console.log('signup insert result', { data, error });
                if (error) throw error;
                if (status) status.textContent = 'Signup submitted ✅';
                try { window.dispatchEvent(new CustomEvent('signup:saved', { detail: { payload } })); } catch (e) {}
                flushSignupQueue();
                return;
            }
        } catch (err) {
            console.warn('Supabase signup insert failed', err);
            if (status) status.textContent = 'Supabase save failed (see console)';
        }

        // Fallback: queue locally
        try {
            const queue = JSON.parse(localStorage.getItem('signup_queue') || '[]');
            queue.push(payload);
            localStorage.setItem('signup_queue', JSON.stringify(queue));
            if (status) status.textContent = 'Saved locally (will flush when online) ✅';
        } catch (e) {
            console.error('local signup save failed', e);
            if (status) status.textContent = 'Save failed';
        }
    });
});