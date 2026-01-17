// reset-password.js

document.addEventListener('DOMContentLoaded', async () => {
    const requestForm = document.getElementById('request-link-form');
    const resetForm = document.getElementById('reset-password-form');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
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

    // Listen for auth state changes - Supabase automatically handles the hash fragment
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth event:', event, 'Session:', session ? 'exists' : 'null');
        
        if (event === 'PASSWORD_RECOVERY') {
            console.log('Password recovery event detected');
            hasRecoverySession = true;
            step1.style.display = 'none';
            step2.style.display = 'block';
            resetStatus.style.display = 'none';
        } else if (event === 'SIGNED_IN' && session) {
            // Check if this is from a recovery link
            const hash = window.location.hash;
            if (hash.includes('type=recovery')) {
                console.log('Signed in via recovery link');
                hasRecoverySession = true;
                step1.style.display = 'none';
                step2.style.display = 'block';
                resetStatus.style.display = 'none';
            }
        }
    });

    // Also check URL hash on page load for recovery tokens
    const hash = window.location.hash;
    console.log('URL hash:', hash);
    
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
        console.log('Recovery token in URL, checking session...');
        
        // Give Supabase a moment to process the hash
        setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            console.log('Session check after timeout:', session ? 'exists' : 'missing');
            
            if (session) {
                hasRecoverySession = true;
                step1.style.display = 'none';
                step2.style.display = 'block';
                // Clear the hash
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                console.log('No session after recovery token - may need to request new link');
            }
        }, 500);
    }

    // Handle email verification request
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        requestStatus.style.display = 'none';
        const email = requestForm.elements['email'].value;

        try {
            console.log('Sending reset password email to:', email);
            // Use production URL for password reset redirect
            const redirectUrl = 'https://nextstep-oi6a.vercel.app/reset-password.html';
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
                
                // Save email to sessionStorage for next step
                sessionStorage.setItem('reset-email', email);
                
                // Show step 2 after 2 seconds
                setTimeout(() => {
                    step1.style.display = 'none';
                    step2.style.display = 'block';
                }, 2000);
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
