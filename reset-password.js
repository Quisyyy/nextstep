// reset-password.js

document.addEventListener('DOMContentLoaded', async () => {
    const requestForm = document.getElementById('request-link-form');
    const resetForm = document.getElementById('reset-password-form');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const requestStatus = requestForm.querySelector('.status');
    const resetStatus = resetForm.querySelector('.status');
    const toggleButtons = document.querySelectorAll('.toggle-password');

    // Wait for Supabase to be ready
    const supabase = await window.supabaseReady;

    if (!supabase) {
        console.error('Supabase client failed to initialize');
        requestStatus.textContent = '✗ Error: Could not connect to Supabase. Please refresh the page.';
        requestStatus.className = 'status error';
        requestStatus.style.display = 'block';
        return;
    }

    console.log('Supabase initialized successfully');

    // Toggle password visibility
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetName = btn.dataset.target;
            const input = resetForm.elements[targetName];
            
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = 'Hide';
            } else {
                input.type = 'password';
                btn.textContent = 'Show';
            }
        });
    });

    // Track if we have a valid recovery session
    let hasRecoverySession = false;

    // Function to show password reset form
    const showPasswordResetForm = () => {
        hasRecoverySession = true;
        step1.style.display = 'none';
        step2.style.display = 'block';
        step3.style.display = 'none';
        resetStatus.style.display = 'none';
        console.log('Showing password reset form');
    };

    // Function to show recovery error
    const showRecoveryError = () => {
        step1.style.display = 'none';
        step2.style.display = 'none';
        step3.style.display = 'block';
        console.log('Showing recovery error (Step 3)');
    };

    // Listen for auth state changes - Supabase automatically handles the hash fragment
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth event:', event, 'Session:', session ? 'exists' : 'null');
        
        if (event === 'PASSWORD_RECOVERY') {
            console.log('Password recovery event detected');
            showPasswordResetForm();
        } else if (event === 'SIGNED_IN' && session) {
            // Check if this is from a recovery link
            const hash = window.location.hash;
            if (hash.includes('type=recovery')) {
                console.log('Signed in via recovery link');
                showPasswordResetForm();
            }
        }
    });

    // Check URL for recovery tokens - both in hash and query params
    const fullUrl = window.location.href;
    const hash = window.location.hash;
    const search = window.location.search;
    console.log('Current URL:', fullUrl);
    console.log('Hash:', hash);
    console.log('Search:', search);
    
    const hasRecoveryToken = hash.includes('type=recovery') || 
                             hash.includes('access_token') ||
                             search.includes('type=recovery') ||
                             search.includes('access_token');
    
    if (hasRecoveryToken) {
        console.log('Recovery token detected in URL');
        
        // Supabase automatically handles the hash fragment
        // but we need to wait for it to be processed
        // Try multiple times to get the session
        let attempts = 0;
        const maxAttempts = 20; // Try for up to 10 seconds
        
        const checkSession = setInterval(async () => {
            attempts++;
            try {
                // First, try to get the current session from storage
                const { data: { session } } = await supabase.auth.getSession();
                console.log('Session check attempt', attempts, '- Session exists:', !!session);
                
                if (session) {
                    console.log('Recovery session established! User:', session.user?.email);
                    clearInterval(checkSession);
                    showPasswordResetForm();
                    // Clear the hash after showing the form
                    window.history.replaceState({}, document.title, window.location.pathname);
                    return;
                }
                
                // If still no session after first few attempts, try refreshing from hash
                if (attempts === 1) {
                    // Force Supabase to parse the hash by calling onAuthStateChange
                    console.log('Triggering Supabase hash parsing...');
                }
            } catch (err) {
                console.error('Error checking session:', err);
            }
            
            if (attempts >= maxAttempts) {
                clearInterval(checkSession);
                console.warn('Timeout: Could not establish recovery session after', maxAttempts * 500, 'ms');
                console.warn('This may mean the reset link has expired or is invalid.');
                showRecoveryError();
            }
        }, 500);
        
        // Also listen for the PASSWORD_RECOVERY event which should fire
        const unsubscribe = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change event:', event, 'Has session:', !!session);
            if (event === 'PASSWORD_RECOVERY') {
                console.log('Detected PASSWORD_RECOVERY event');
                clearInterval(checkSession);
                unsubscribe?.();
                showPasswordResetForm();
            } else if (session && hasRecoveryToken) {
                // User is signed in with recovery token
                console.log('Detected signed in user with recovery token');
                clearInterval(checkSession);
                unsubscribe?.();
                showPasswordResetForm();
            }
        });
    } else {
        console.log('No recovery token found in URL');
    }

    // Handle email verification request
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        requestStatus.style.display = 'none';
        const email = requestForm.elements['email'].value;

        try {
            console.log('Sending reset password email to:', email);
            
            // Determine redirect URL based on current domain
            let redirectUrl = 'https://nextstep-oi6a.vercel.app/reset-password.html';
            
            // For localhost development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                redirectUrl = window.location.origin + '/reset-password.html';
                console.log('Using localhost redirect:', redirectUrl);
            } else if (window.location.hostname.includes('admin')) {
                redirectUrl = 'https://admin-next-step.vercel.app/reset-password.html';
            }
            
            console.log('Reset redirect URL:', redirectUrl);
            
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl
            });

            if (error) {
                console.error('Reset password error:', error);
                requestStatus.textContent = '✗ ' + (error.message || 'Failed to send reset link.');
                requestStatus.className = 'status error';
                requestStatus.style.display = 'block';
            } else {
                console.log('Reset email sent successfully');
                requestStatus.textContent = '✓ Check your email for reset instructions!';
                requestStatus.className = 'status success';
                requestStatus.style.display = 'block';
                
                // Save email to sessionStorage for reference
                sessionStorage.setItem('reset-email', email);
                
                // Stay on step 1 - user will click link from email to go to step 2
                // Do NOT auto-advance to step 2
            }
        } catch (err) {
            console.error('Error:', err);
            requestStatus.textContent = '✗ Error: ' + err.message;
            requestStatus.className = 'status error';
            requestStatus.style.display = 'block';
        }
    });

    // Handle password reset
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        resetStatus.style.display = 'none';
        
        const newPassword = resetForm.elements['new-password'].value;
        const confirmPassword = resetForm.elements['confirm-password'].value;

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            resetStatus.textContent = 'Passwords do not match.';
            resetStatus.className = 'status error';
            resetStatus.style.display = 'block';
            return;
        }

        // Validate password strength
        if (newPassword.length < 8) {
            resetStatus.textContent = 'Password must be at least 8 characters long.';
            resetStatus.className = 'status error';
            resetStatus.style.display = 'block';
            return;
        }

        try {
            // First check if we have a valid session
            const { data: { session } } = await supabase.auth.getSession();
            console.log('Session before password update:', session ? 'exists' : 'missing');
            
            if (!session) {
                resetStatus.textContent = '✗ Auth session missing! Please click the reset link from your email again, or request a new one.';
                resetStatus.className = 'status error';
                resetStatus.style.display = 'block';
                return;
            }
            
            console.log('Updating password...');
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                console.error('Password update error:', error);
                resetStatus.textContent = '✗ ' + (error.message || 'Failed to reset password.');
                resetStatus.className = 'status error';
                resetStatus.style.display = 'block';
            } else {
                console.log('Password updated successfully');
                resetStatus.textContent = '✓ Password reset successful! Redirecting...';
                resetStatus.className = 'status success';
                resetStatus.style.display = 'block';
                
                // Sign out after password reset
                await supabase.auth.signOut();
                
                // Clear session storage
                sessionStorage.removeItem('reset-email');
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        } catch (err) {
            console.error('Error:', err);
            resetStatus.textContent = '✗ Error: ' + err.message;
            resetStatus.className = 'status error';
            resetStatus.style.display = 'block';
        }
    });
});
