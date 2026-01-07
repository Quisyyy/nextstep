// Alumni Login Gate: single clean implementation
(function() {
    async function ensureSupabaseReady(timeout = 5000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (window.supabase && window.supabaseClientReady) return true;
            await new Promise(r => setTimeout(r, 120));
        }
        return false;
    }

    function setStatus(el, msg, type = 'info') {
        if (!el) return;
        el.textContent = msg || '';
        el.className = `status ${type}`;
        el.style.display = msg ? 'block' : 'none';
        el.style.color = type === 'error' ? '#d32f2f' : type === 'success' ? '#2e7d32' : '#0b66b3';
    }

    // Simple password hashing for verification
    async function simpleHash(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function verifyUserCredentials(email, password) {
        const passwordHash = await simpleHash(password);
        
        // Try signups table first (has password_hash)
        try {
            let { data, error } = await window.supabase
                .from('signups')
                .select('email, password_hash')
                .eq('email', email)
                .limit(1);
            
            if (!error && Array.isArray(data) && data.length) {
                const user = data[0];
                if (user.password_hash === passwordHash) {
                    return { success: true, user };
                } else {
                    return { success: false, error: 'The Password is incorrect.' };
                }
            }

            // ilike fallback
            ({ data, error } = await window.supabase
                .from('signups')
                .select('email, password_hash')
                .ilike('email', email)
                .limit(1));
            
            if (!error && Array.isArray(data) && data.length) {
                const user = data[0];
                if (user.password_hash === passwordHash) {
                    return { success: true, user };
                } else {
                    return { success: false, error: 'The Password is incorrect.' };
                }
            }
        } catch (err) {
            console.warn('signups table query failed', err);
        }
        
        // Try alumni_profiles table (may have different password column)
        try {
            let { data, error } = await window.supabase
                .from('alumni_profiles')
                .select('email, password_hash')
                .eq('email', email)
                .limit(1);
            
            if (!error && Array.isArray(data) && data.length) {
                const user = data[0];
                if (user.password_hash === passwordHash) {
                    return { success: true, user };
                } else {
                    return { success: false, error: 'The Password is incorrect.' };
                }
            }

            // ilike fallback
            ({ data, error } = await window.supabase
                .from('alumni_profiles')
                .select('email, password_hash')
                .ilike('email', email)
                .limit(1));
            
            if (!error && Array.isArray(data) && data.length) {
                const user = data[0];
                if (user.password_hash === passwordHash) {
                    return { success: true, user };
                } else {
                    return { success: false, error: 'The Password is incorrect.' };
                }
            }
        } catch (err) {
            console.warn('alumni_profiles table query failed', err);
        }
        
        return { success: false, error: 'Account not found' };
    }

    async function handleLoginSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const statusEl = form.querySelector('.status');
        const btn = form.querySelector('button[type="submit"]');
        const emailInput = form.querySelector('input[name="email"]');
        const passwordInput = form.querySelector('input[name="password"]');
        const email = (emailInput && emailInput.value || '').trim().toLowerCase();
        const password = (passwordInput && passwordInput.value) || '';

        if (!email || !password) { setStatus(statusEl, 'Enter your email and password.', 'error'); return; }
        setStatus(statusEl, 'Checking account…');
        btn && (btn.disabled = true);
        try {
            const ready = await ensureSupabaseReady();
            if (!ready) throw new Error('Service not ready. Try again shortly.');
            if (!window.supabase) throw new Error('Supabase client missing');
            
            // Verify user credentials (email and password)
            const result = await verifyUserCredentials(email, password);
            
            if (!result.success) {
                if (result.error === 'Account not found') {
                    setStatus(statusEl, "You don't have an account yet, Please create or sign up.", 'error');
                } else {
                    setStatus(statusEl, result.error || 'Login failed', 'error');
                }
                btn && (btn.disabled = false);
                passwordInput && passwordInput.focus();
                return;
            }
            
            setStatus(statusEl, '✅ Login successful. Redirecting…', 'success');
            localStorage.setItem('currentUserEmail', email);
            // Go to app homepage after login
            setTimeout(() => { window.location.href = 'homepage.html'; }, 600);
        } catch (err) {
            console.error('Login failed', err);
            setStatus(statusEl, err.message || 'Login failed', 'error');
        } finally {
            btn && (btn.disabled = false);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.querySelector('#alumni-login-form');
        if (form) {
            form.addEventListener('submit', handleLoginSubmit);
            // Optional: prefill from query params e.g., ?email=a@b.com&password=xyz
            const params = new URLSearchParams(window.location.search);
            const email = params.get('email');
            const password = params.get('password');
            const emailInput = form.querySelector('input[name="email"]');
            const passwordInput = form.querySelector('input[name="password"]');
            if (email && emailInput) emailInput.value = decodeURIComponent(email);
            if (password && passwordInput) passwordInput.value = password;
            if (email && password) {
                // slight delay to allow Supabase init
                setTimeout(() => form.requestSubmit ? form.requestSubmit() : form.submit(), 150);
            }
        }
    });
})();