/**
 * login-simple.js - Simple login form handler
 * Works with Supabase Auth
 */

console.log('login-simple.js loaded');

// Wait for Supabase client
async function waitForSupabase(timeout = 15000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (window.supabaseClient && window.supabaseReady) {
            return window.supabaseClient;
        }
        await new Promise(r => setTimeout(r, 100));
    }
    throw new Error('Supabase client timeout');
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const statusDiv = form.querySelector('.status') || document.getElementById('loginStatus');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const email = emailInput?.value?.trim()?.toLowerCase() || '';
    const password = passwordInput?.value || '';
    
    // Clear status
    if (statusDiv) {
        statusDiv.textContent = '';
        statusDiv.style.display = 'none';
    }
    
    // Validation
    if (!email || !password) {
        if (statusDiv) {
            statusDiv.textContent = 'Please enter email and password';
            statusDiv.style.display = 'block';
            statusDiv.style.color = '#d32f2f';
        }
        return;
    }
    
    // Disable button and show status
    submitBtn.disabled = true;
    if (statusDiv) {
        statusDiv.textContent = 'Logging in...';
        statusDiv.style.display = 'block';
        statusDiv.style.color = '#0b66b3';
    }
    
    try {
        const supabase = await waitForSupabase();
        
        console.log('Attempting login:', email);
        
        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('Login error:', error);
            
            if (statusDiv) {
                if (error.message.includes('Invalid')) {
                    statusDiv.textContent = 'Invalid email or password';
                } else if (error.message.includes('not confirmed')) {
                    statusDiv.textContent = 'Please verify your email first';
                } else {
                    statusDiv.textContent = 'Login error: ' + error.message;
                }
                statusDiv.style.color = '#d32f2f';
            }
            
            submitBtn.disabled = false;
            return;
        }
        
        console.log('Login successful:', data);
        
        if (statusDiv) {
            statusDiv.textContent = '✅ Login successful! Redirecting...';
            statusDiv.style.color = '#2e7d32';
        }
        
        // Store info
        if (data.user) {
            localStorage.setItem('currentUserEmail', email);
            localStorage.setItem('currentUserId', data.user.id);
            localStorage.setItem('currentUserName', data.user.user_metadata?.full_name || '');
        }
        
        // Redirect to homepage
        setTimeout(() => {
            window.location.href = 'homepage.html';
        }, 1000);
        
    } catch (err) {
        console.error('Login exception:', err);
        if (statusDiv) {
            statusDiv.textContent = 'Error: ' + err.message;
            statusDiv.style.color = '#d32f2f';
        }
        submitBtn.disabled = false;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Login DOM ready');
    
    // Find form - could be #signupForm, #loginForm, or first form
    const form = document.getElementById('loginForm') || 
                 document.getElementById('alumni-login-form') ||
                 document.querySelector('form');
    
    if (form) {
        form.addEventListener('submit', handleLogin);
        console.log('Login form listener attached');
    } else {
        console.warn('No login form found');
    }
});
