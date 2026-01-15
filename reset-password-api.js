// reset-password-api.js
// Handles password reset requests from the frontend

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory storage for verification codes (use database in production)
const verificationCodes = new Map();

module.exports = async function (req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ success: false, message: 'Method not allowed' });
        return;
    }

    const { email, action, newPassword } = req.body;

    try {
        if (action === 'send-link') {
            // Handle sending verification link
            if (!email) {
                return res.status(400).json({ success: false, message: 'Email required' });
            }

            // Check if user exists
            const { data: user, error: userError } = await supabase
                .from('alumni_profiles')
                .select('id')
                .eq('email', email)
                .single();

            if (userError || !user) {
                return res.status(404).json({ success: false, message: 'Email not found in our system' });
            }

            // Generate verification code
            const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
            const expiryTime = Date.now() + 15 * 60 * 1000; // 15 minutes

            // Store verification code
            verificationCodes.set(email, { code: verificationCode, expires: expiryTime });

            // For now, just log the code (in production, send via email)
            console.log(`Password reset code for ${email}: ${verificationCode}`);

            res.json({ 
                success: true, 
                message: 'Reset code generated. For testing, check server logs for the code.'
            });

        } else if (action === 'reset-password') {
            // Handle password reset
            if (!email || !newPassword) {
                return res.status(400).json({ success: false, message: 'Email and new password required' });
            }

            // Update password using Supabase Auth
            const { error: updateError } = await supabase.auth.admin.updateUserByEmail(email, { 
                password: newPassword 
            });

            if (updateError) {
                console.error('Password update error:', updateError);
                return res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.' });
            }

            // Clear verification code after successful reset
            verificationCodes.delete(email);

            res.json({ success: true, message: 'Password reset successful' });

        } else {
            res.status(400).json({ success: false, message: 'Invalid action' });
        }
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};
