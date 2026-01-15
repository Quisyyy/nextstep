// reset-password-api.js
// Handles password reset requests from the frontend

const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory storage for verification codes (use database in production)
const verificationCodes = new Map();

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});

module.exports = async function (req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ success: false, message: 'Method not allowed' });
        return;
    }

    const { email, action, code, newPassword } = req.body;

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

            // Send email with verification code
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Password Reset Verification Code',
                    html: `
                        <h2>Password Reset Request</h2>
                        <p>Your verification code is: <strong>${verificationCode}</strong></p>
                        <p>This code expires in 15 minutes.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                    `
                });

                res.json({ success: true, message: 'Verification code sent to your email' });
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                res.status(500).json({ success: false, message: 'Failed to send verification code. Please try again.' });
            }

        } else if (action === 'reset-password') {
            // Handle password reset
            if (!email || !code || !newPassword) {
                return res.status(400).json({ success: false, message: 'Email, code, and new password required' });
            }

            // Verify the code
            const storedVerification = verificationCodes.get(email);
            if (!storedVerification) {
                return res.status(400).json({ success: false, message: 'No verification code found. Please request a new one.' });
            }

            if (Date.now() > storedVerification.expires) {
                verificationCodes.delete(email);
                return res.status(400).json({ success: false, message: 'Verification code expired. Please request a new one.' });
            }

            if (storedVerification.code !== code.toUpperCase()) {
                return res.status(400).json({ success: false, message: 'Invalid verification code' });
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
