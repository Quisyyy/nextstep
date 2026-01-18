// Signup page JS: submits signups to Supabase `signups` table with OTP verification.

// OTP state management
let otpData = {
    code: null,
    email: null,
    expiry: null,
    verified: false
};

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

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
        const { data, error } = await window.supabase.from('alumni_data').insert(q);
        console.log('signup queue flush', { data, error });
        if (!error) {
            localStorage.removeItem('signup_queue');
            const s = document.getElementById('signupStatus');
            if (s) s.textContent = 'Flushed offline signups to Supabase ✅';
            try { window.dispatchEvent(new CustomEvent('signup:flushed', { detail: { count: Array.isArray(data) ? data.length : 0 } })); } catch (e) {}
        }
    } catch (e) { console.warn('flushSignupQueue failed', e); }
}

(async function tryFlush() {
    await new Promise(r => setTimeout(r, 800));
    flushSignupQueue();
})();

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    const status = document.getElementById('signupStatus');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const otpSection = document.getElementById('otpSection');
    const emailInput = document.getElementById('signupEmail');
    const otpInput = document.getElementById('signupOtp');
    const signupBtn = document.getElementById('signupBtn');
    const emailHelp = document.getElementById('emailHelp');
    
    if (!form) return;

    // Send OTP button handler
    sendOtpBtn.addEventListener('click', async function() {
        const email = emailInput.value.trim();
        
        if (!email || !email.includes('@')) {
            emailHelp.textContent = 'Please enter a valid email address';
            emailHelp.style.color = '#d9534f';
            return;
        }

        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = 'Sending...';
        emailHelp.textContent = 'Sending OTP...';
        emailHelp.style.color = '#0b66b3';

        // Generate OTP
        const otp = generateOTP();
        
        // Send OTP email
        const sent = await sendOTPEmail(email, otp);
        
        if (sent) {
            // Store OTP data
            otpData = {
                code: otp,
                email: email,
                expiry: Date.now() + (10 * 60 * 1000), // 10 minutes
                verified: false
            };

            // Show OTP section
            otpSection.style.display = 'block';
            emailInput.readOnly = true;
            sendOtpBtn.textContent = 'Resend OTP';
            sendOtpBtn.disabled = false;
            emailHelp.textContent = 'OTP sent! Check your email.';
            emailHelp.style.color = '#28a745';

            // Enable signup button when OTP is verified
            otpInput.addEventListener('input', function() {
                const enteredOtp = otpInput.value.trim();
                if (enteredOtp === otpData.code) {
                    if (Date.now() > otpData.expiry) {
                        emailHelp.textContent = 'OTP expired. Please request a new one.';
                        emailHelp.style.color = '#d9534f';
                        signupBtn.disabled = true;
                    } else {
                        otpData.verified = true;
                        signupBtn.disabled = false;
                        emailHelp.textContent = '✓ Email verified!';
                        emailHelp.style.color = '#28a745';
                        otpInput.readOnly = true;
                    }
                } else if (enteredOtp.length === 6) {
                    emailHelp.textContent = 'Invalid OTP. Please try again.';
                    emailHelp.style.color = '#d9534f';
                }
            });
        } else {
            sendOtpBtn.textContent = 'Send OTP';
            sendOtpBtn.disabled = false;
            emailHelp.textContent = 'Failed to send OTP. Please try again.';
            emailHelp.style.color = '#d9534f';
        }
    });

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

        // Verify OTP
        if (!otpData.verified || otpData.email !== email) {
            if (status) status.textContent = 'Please verify your email with OTP first';
            return;
        }

        if (Date.now() > otpData.expiry) {
            if (status) status.textContent = 'OTP expired. Please request a new one.';
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
            confirmed: true, // Email verified via OTP
            email_verified: true,
            created_at: new Date().toISOString()
        };

        try {
            const ready = await ensureSupabaseReady(2500);
            if (ready) {
                const { data, error } = await window.supabase.from('alumni_profiles').insert([payload]);
                console.log('signup insert result', { data, error });
                if (error) throw error;
                if (status) {
                    status.textContent = 'Signup successful! ✅';
                    status.style.color = '#28a745';
                }
                
                // Store email for login
                localStorage.setItem('currentUserEmail', email);
                
                try { window.dispatchEvent(new CustomEvent('signup:saved', { detail: { payload } })); } catch (e) {}
                flushSignupQueue();
                
                // Redirect to information page after 1.5 seconds
                setTimeout(() => {
                    window.location.href = 'Information.html';
                }, 1500);
                return;
            }
        } catch (err) {
            console.warn('Supabase signup insert failed', err);
            if (status) {
                status.textContent = 'Supabase save failed (see console)';
                status.style.color = '#d9534f';
            }
        }

        // Fallback: queue locally
        try {
            const queue = JSON.parse(localStorage.getItem('signup_queue') || '[]');
            queue.push(payload);
            localStorage.setItem('signup_queue', JSON.stringify(queue));
            if (status) {
                status.textContent = 'Saved locally (will flush when online) ✅';
                status.style.color = '#28a745';
            }
            
            // Still redirect even if saved locally
            setTimeout(() => {
                window.location.href = 'Information.html';
            }, 1500);
        } catch (e) {
            console.error('local signup save failed', e);
            if (status) {
                status.textContent = 'Save failed';
                status.style.color = '#d9534f';
            }
        }
    });
});