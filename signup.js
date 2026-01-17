/**
 * signup.js - Client-side signup form handling for the root signup page
 * 
 * This script handles form submission to Supabase's `signups` table with offline queueing.
 * Form fields: #signupName, #signupEmail, #signupPhone, #signupPassword, #signupConfirm
 * Status updates shown in #signupStatus
 * 
 * Storage: Uses localStorage key `signup_queue` for offline submissions
 * Events: Dispatches `signup:saved` and `signup:flushed` for cross-window coordination
 */

console.log('signup.js loaded');

// Simple password hashing for demo purposes (use proper server-side hashing in production)
async function simpleHash(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Wait for Supabase client to be ready with timeout
function ensureSupabaseReady(timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
        if (window.supabase && window.supabaseClientReady) {
            resolve(window.supabase);
            return;
        }

        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (window.supabase && window.supabaseClientReady) {
                clearInterval(checkInterval);
                resolve(window.supabase);
            } else if (Date.now() - startTime > timeoutMs) {
                clearInterval(checkInterval);
                reject(new Error('Supabase client not ready within timeout'));
            }
        }, 100);
    });
}

// Check if email has already been used for signup
async function checkEmailExists(email) {
    try {
        const supabase = await ensureSupabaseReady();
        const { data, error } = await supabase
            .from('signups')
            .select('id')
            .eq('email', email.toLowerCase())
            .limit(1);

        if (error) {
            console.error('Error checking email:', error);
            return false; // Allow signup if we can't check (network issue)
        }

        return data && data.length > 0;
    } catch (error) {
        console.error('Exception checking email:', error);
        return false; // Allow signup if we can't check
    }
}

// Queue signup data for later submission
function queueSignup(signupData) {
    try {
        const queue = JSON.parse(localStorage.getItem('signup_queue') || '[]');
        queue.push({
            ...signupData,
            queued_at: new Date().toISOString()
        });
        localStorage.setItem('signup_queue', JSON.stringify(queue));
        console.log('Signup queued for later submission:', signupData);
        return true;
    } catch (error) {
        console.error('Failed to queue signup:', error);
        return false;
    }
}

// Flush queued signups to Supabase
async function flushSignupQueue() {
    const queue = JSON.parse(localStorage.getItem('signup_queue') || '[]');
    if (queue.length === 0) {
        console.log('No queued signups to flush');
        return;
    }

    try {
        const supabase = await ensureSupabaseReady();

        console.log(`Flushing ${queue.length} queued signups...`);
        const { data, error } = await supabase
            .from('signups')
            .insert(queue);

        if (error) {
            console.error('Error flushing signup queue:', error);
            return;
        }

        console.log('Successfully flushed signup queue:', data);
        localStorage.removeItem('signup_queue');

        // Dispatch event for any listening admin pages
        window.dispatchEvent(new CustomEvent('signup:flushed', {
            detail: { count: queue.length, data }
        }));
    } catch (error) {
        console.error('Failed to flush signup queue:', error);
    }
}

// Main form submission handler
async function handleSignupSubmission(event) {
    event.preventDefault();

    const form = event.target;
    const statusSpan = document.getElementById('signupStatus');

    // Get form data
    const formData = {
        full_name: document.getElementById('signupName').value.trim(),
        email: document.getElementById('signupEmail').value.trim(),
        phone: document.getElementById('signupPhone').value.trim() || null,
        password: document.getElementById('signupPassword').value,
        confirm_password: document.getElementById('signupConfirm').value,
        role: document.getElementById('signupRole').value || 'student'
    };

    // Check terms and conditions checkbox
    const termsCheckbox = document.getElementById('signupTerms');
    if (!termsCheckbox || !termsCheckbox.checked) {
        statusSpan.textContent = 'You must agree to the Terms and Conditions to sign up';
        statusSpan.style.color = '#d32f2f';
        return;
    }

    // Basic validation
    if (!formData.full_name || !formData.email || !formData.password) {
        statusSpan.textContent = 'Please fill in all required fields';
        statusSpan.style.color = '#d32f2f';
        return;
    }

    if (formData.password !== formData.confirm_password) {
        statusSpan.textContent = 'Passwords do not match';
        statusSpan.style.color = '#d32f2f';
        return;
    }

    if (formData.password.length < 8) {
        statusSpan.textContent = 'Password must be at least 8 characters';
        statusSpan.style.color = '#d32f2f';
        return;
    }

    // Password complexity validation
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);

    if (!hasUpperCase) {
        statusSpan.textContent = 'Password must contain at least one uppercase letter';
        statusSpan.style.color = '#d32f2f';
        return;
    }

    if (!hasLowerCase) {
        statusSpan.textContent = 'Password must contain at least one lowercase letter';
        statusSpan.style.color = '#d32f2f';
        return;
    }

    if (!hasNumber) {
        statusSpan.textContent = 'Password must contain at least one number';
        statusSpan.style.color = '#d32f2f';
        return;
    }

    if (!hasSymbol) {
        statusSpan.textContent = 'Password must contain at least one symbol (!@#$%^&*...)';
        statusSpan.style.color = '#d32f2f';
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        statusSpan.textContent = 'Please enter a valid email address';
        statusSpan.style.color = '#d32f2f';
        return;
    }

    statusSpan.textContent = 'Checking email...';
    statusSpan.style.color = '#0b66b3';

    // Check if email already exists
    const emailExists = await checkEmailExists(formData.email);
    if (emailExists) {
        statusSpan.textContent = 'Email already registered. Please use a different email or login.';
        statusSpan.style.color = '#d32f2f';
        return;
    }

    statusSpan.textContent = 'Signing up...';
    statusSpan.style.color = '#0b66b3';

    try {
        const supabase = await ensureSupabaseReady();
        
        // Use Supabase Auth to create the user (this enables password reset!)
        console.log('Creating user with Supabase Auth...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.full_name,
                    phone: formData.phone,
                    role: formData.role || 'user'
                }
            }
        });

        if (authError) {
            console.error('Supabase Auth signup error:', authError);
            statusSpan.textContent = `Error: ${authError.message}`;
            statusSpan.style.color = '#d32f2f';
            return;
        }

        console.log('Auth signup successful:', authData);

        // Also save to signups table for additional data tracking
        const signupPayload = {
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            password_hash: '[stored_in_auth]', // Password is managed by Supabase Auth
            role: formData.role || 'user',
            confirmed: false,
            confirm_token: null,
            metadata: { auth_user_id: authData.user?.id },
            created_at: new Date().toISOString()
        };

        // Try to save to signups table (non-blocking)
        supabase
            .from('signups')
            .insert([signupPayload])
            .then(({ error }) => {
                if (error) console.warn('Could not save to signups table:', error.message);
            });

        // Check if email confirmation is required
        if (authData.user && !authData.session) {
            statusSpan.textContent = 'Account created! Please check your email to confirm.';
            statusSpan.style.color = '#2e7d32';
        } else {
            statusSpan.textContent = 'Account created successfully!';
            statusSpan.style.color = '#2e7d32';
        }

        // Clear form
        form.reset();

        // Dispatch success event
        window.dispatchEvent(new CustomEvent('signup:saved', {
            detail: { data: authData, payload: signupPayload }
        }));

        // Redirect to login page after a delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        console.error('Signup submission error:', error);
        statusSpan.textContent = 'Failed to create account: ' + error.message;
        statusSpan.style.color = '#d32f2f';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing signup form...');

    const form = document.getElementById('signupForm');
    if (form) {
        form.addEventListener('submit', handleSignupSubmission);
        console.log('Signup form handler attached');
    } else {
        console.error('Signup form not found');
    }

    // Try to flush any queued signups when page loads
    setTimeout(flushSignupQueue, 2000);
});