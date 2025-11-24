/**
 * Email Service Integration
 * 
 * This file provides email sending functionality for OTP verification.
 * 
 * SETUP INSTRUCTIONS:
 * ===================
 * 
 * Option 1: EmailJS (Recommended for quick setup)
 * -----------------------------------------------
 * 1. Sign up at https://www.emailjs.com/ (Free tier: 200 emails/month)
 * 2. Create an email service (Gmail, Outlook, etc.)
 * 3. Create an email template with variables: {{to_email}}, {{otp_code}}, {{to_name}}
 * 4. Get your Service ID, Template ID, and Public Key
 * 5. Add this script tag to your HTML BEFORE signup.js:
 *    <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
 * 6. Update the config below with your credentials
 * 
 * Option 2: Custom Backend API
 * ----------------------------
 * 1. Create a backend endpoint that accepts: { to_email, otp_code, to_name }
 * 2. Update the sendEmailViaAPI function below
 * 
 * Option 3: Supabase Edge Functions
 * ----------------------------------
 * 1. Create a Supabase Edge Function to send emails
 * 2. Use a service like SendGrid, Mailgun, or Resend
 * 3. Update the sendEmailViaSupabase function below
 */

// ===== CONFIGURATION =====
const EMAIL_CONFIG = {
    // EmailJS Configuration
    emailjs: {
        enabled: false, // Set to true when configured
        serviceId: 'YOUR_SERVICE_ID',
        templateId: 'YOUR_TEMPLATE_ID',
        publicKey: 'YOUR_PUBLIC_KEY'
    },
    
    // Custom API Configuration
    customApi: {
        enabled: false, // Set to true when configured
        endpoint: 'https://your-api.com/send-otp'
    },
    
    // Supabase Edge Function Configuration
    supabaseFunction: {
        enabled: false, // Set to true when configured
        functionName: 'send-otp-email'
    }
};

// ===== EMAIL SENDING FUNCTIONS =====

/**
 * Send OTP email via EmailJS
 */
async function sendEmailViaEmailJS(email, otp, name = '') {
    if (!window.emailjs) {
        console.error('EmailJS library not loaded. Add the script tag.');
        return false;
    }

    try {
        const templateParams = {
            to_email: email,
            otp_code: otp,
            to_name: name || email.split('@')[0],
            app_name: 'NEXT STEP',
            expiry_minutes: '10'
        };

        await window.emailjs.send(
            EMAIL_CONFIG.emailjs.serviceId,
            EMAIL_CONFIG.emailjs.templateId,
            templateParams,
            EMAIL_CONFIG.emailjs.publicKey
        );

        console.log('✅ Email sent successfully via EmailJS');
        return true;
    } catch (error) {
        console.error('❌ EmailJS send failed:', error);
        return false;
    }
}

/**
 * Send OTP email via custom backend API
 */
async function sendEmailViaAPI(email, otp, name = '') {
    try {
        const response = await fetch(EMAIL_CONFIG.customApi.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to_email: email,
                otp_code: otp,
                to_name: name || email.split('@')[0],
                app_name: 'NEXT STEP'
            })
        });

        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }

        console.log('✅ Email sent successfully via Custom API');
        return true;
    } catch (error) {
        console.error('❌ Custom API send failed:', error);
        return false;
    }
}

/**
 * Send OTP email via Supabase Edge Function
 */
async function sendEmailViaSupabase(email, otp, name = '') {
    try {
        if (!window.supabase) {
            throw new Error('Supabase client not initialized');
        }

        const { data, error } = await window.supabase.functions.invoke(
            EMAIL_CONFIG.supabaseFunction.functionName,
            {
                body: {
                    to_email: email,
                    otp_code: otp,
                    to_name: name || email.split('@')[0],
                    app_name: 'NEXT STEP'
                }
            }
        );

        if (error) throw error;

        console.log('✅ Email sent successfully via Supabase Function');
        return true;
    } catch (error) {
        console.error('❌ Supabase Function send failed:', error);
        return false;
    }
}

/**
 * Main email sending function - tries configured methods
 */
window.sendOTPEmail = async function(email, otp, name = '') {
    // Try EmailJS first if enabled
    if (EMAIL_CONFIG.emailjs.enabled) {
        const sent = await sendEmailViaEmailJS(email, otp, name);
        if (sent) return true;
    }

    // Try Custom API if enabled
    if (EMAIL_CONFIG.customApi.enabled) {
        const sent = await sendEmailViaAPI(email, otp, name);
        if (sent) return true;
    }

    // Try Supabase Function if enabled
    if (EMAIL_CONFIG.supabaseFunction.enabled) {
        const sent = await sendEmailViaSupabase(email, otp, name);
        if (sent) return true;
    }

    // Fallback: Log to console and show alert (for development)
    console.warn('⚠️ No email service configured. Showing OTP in alert for development.');
    console.log('=== OTP EMAIL (DEV MODE) ===');
    console.log('To:', email);
    console.log('OTP Code:', otp);
    console.log('============================');
    
    alert(`🔐 OTP VERIFICATION\n\nYour OTP code is: ${otp}\n\nEmail: ${email}\n\n⚠️ Configure email service in email-service.js for production use.`);
    return true; // Return true for development
};

console.log('📧 Email service loaded. Configure EMAIL_CONFIG to enable email sending.');
