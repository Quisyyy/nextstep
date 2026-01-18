/**
 * signup.js - Simple signup form handler
 * Works with Supabase Auth
 */

console.log('signup.js loaded');

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

// Handle signup form submission
async function handleSignup(e) {
    e.preventDefault();
    
    const form = e.target;
    const nameInput = document.getElementById('signupName');
    const emailInput = document.getElementById('signupEmail');
    const phoneInput = document.getElementById('signupPhone');
    const passwordInput = document.getElementById('signupPassword');
    const confirmInput = document.getElementById('signupConfirm');
    const statusDiv = document.getElementById('signupStatus');
    const termsCheckbox = document.getElementById('signupTerms');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Get values
    const full_name = nameInput?.value?.trim() || '';
    const email = emailInput?.value?.trim()?.toLowerCase() || '';
    const phone = phoneInput?.value?.trim() || '';
    const password = passwordInput?.value || '';
    const confirm_password = confirmInput?.value || '';
    
    // Clear status
    statusDiv.textContent = '';
    statusDiv.style.display = 'none';
    
    // Validation
    if (!full_name) {
        statusDiv.textContent = 'Please enter your full name';
        statusDiv.style.display = 'block';
        statusDiv.style.color = '#d32f2f';
        return;
    }
    
    if (!email || !email.includes('@')) {
        statusDiv.textContent = 'Please enter a valid email';
        statusDiv.style.display = 'block';
        statusDiv.style.color = '#d32f2f';
        return;
    }
    
    if (!password || password.length < 6) {
        statusDiv.textContent = 'Password must be at least 6 characters';
        statusDiv.style.display = 'block';
        statusDiv.style.color = '#d32f2f';
        return;
    }
    
    if (password !== confirm_password) {
        statusDiv.textContent = 'Passwords do not match';
        statusDiv.style.display = 'block';
        statusDiv.style.color = '#d32f2f';
        return;
    }
    
    if (termsCheckbox && !termsCheckbox.checked) {
        statusDiv.textContent = 'You must agree to Terms and Conditions';
        statusDiv.style.display = 'block';
        statusDiv.style.color = '#d32f2f';
        return;
    }
    
    // Disable button and show status
    submitBtn.disabled = true;
    statusDiv.textContent = 'Creating account...';
    statusDiv.style.display = 'block';
    statusDiv.style.color = '#0b66b3';
    
    try {
        const supabase = await waitForSupabase();
        
        console.log('Signing up:', email);
        
        // Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: full_name,
                    phone: phone
                }
            }
        });
        
        if (error) {
            console.error('Signup error:', error);
            
            if (error.message.includes('already registered')) {
                statusDiv.textContent = 'This email is already registered. Please login instead.';
            } else if (error.message.includes('password')) {
                statusDiv.textContent = 'Password requirements: min 6 characters';
            } else {
                statusDiv.textContent = 'Signup error: ' + error.message;
            }
            
            statusDiv.style.color = '#d32f2f';
            submitBtn.disabled = false;
            return;
        }
        
        console.log('Signup successful:', data);
        
        statusDiv.textContent = '✅ Account created! Redirecting to login...';
        statusDiv.style.color = '#2e7d32';
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        
    } catch (err) {
        console.error('Signup exception:', err);
        statusDiv.textContent = 'Error: ' + err.message;
        statusDiv.style.color = '#d32f2f';
        submitBtn.disabled = false;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready');
    const form = document.getElementById('signupForm');
    if (form) {
        form.addEventListener('submit', handleSignup);
        console.log('Signup form listener attached');
    }
});
