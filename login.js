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

    // Login using Supabase Auth
    async function loginWithSupabaseAuth(email, password) {
        try {
            const { data, error } = await window.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('Supabase Auth login error:', error);
                if (error.message.includes('Invalid login credentials')) {
                    return { success: false, error: 'Invalid email or password.' };
                }
                if (error.message.includes('Email not confirmed')) {
                    return { success: false, error: 'Please confirm your email first. Check your inbox.' };
                }
                return { success: false, error: error.message };
            }

            if (data.user) {
                return { success: true, user: data.user, session: data.session };
            }

            return { success: false, error: 'Login failed' };
        } catch (err) {
            console.error('Auth login exception:', err);
            return { success: false, error: err.message };
        }
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
            
            // Login using Supabase Auth
            const result = await loginWithSupabaseAuth(email, password);
            
            if (!result.success) {
                if (result.error.includes('Invalid')) {
                    setStatus(statusEl, "Invalid email or password. Please try again.", 'error');
                } else {
                    setStatus(statusEl, result.error || 'Login failed', 'error');
                }
                btn && (btn.disabled = false);
                passwordInput && passwordInput.focus();
                return;
            }
            
            setStatus(statusEl, '✅ Login successful. Redirecting…', 'success');
            localStorage.setItem('currentUserEmail', email);
            // Store user info from auth
            if (result.user) {
                localStorage.setItem('currentUserId', result.user.id);
                localStorage.setItem('currentUserName', result.user.user_metadata?.full_name || '');
            }
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