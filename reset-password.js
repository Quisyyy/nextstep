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

    // Check if we're returning from password reset link (recovery token in URL)
    const hash = window.location.hash;
    console.log('URL hash:', hash);
    if (hash.includes('type=recovery')) {
        console.log('Recovery token detected, showing password reset form');
        step1.style.display = 'none';
        step2.style.display = 'block';
    }

    // Handle email verification request
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        requestStatus.style.display = 'none';
        const email = requestForm.elements['email'].value;

        try {
            console.log('Sending reset password email to:', email);
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
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
