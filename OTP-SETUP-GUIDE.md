# OTP Email Verification Setup Guide

## Overview
The signup system now includes OTP (One-Time Password) email verification to ensure users provide valid email addresses during registration.

## How It Works

1. **User enters email** → Clicks "Send OTP" button
2. **System generates 6-digit OTP** → Valid for 10 minutes
3. **OTP sent to email** → User receives verification code
4. **User enters OTP** → System verifies the code
5. **Email verified** → Signup button becomes enabled
6. **User completes signup** → Account created with verified email

## Files Modified

- `alumni/signup.html` - Added OTP input field and Send OTP button
- `alumni/signup.js` - Added OTP generation and verification logic
- `email-service.js` - Email sending service (NEW)
- `OTP-SETUP-GUIDE.md` - This documentation file (NEW)

## Email Service Setup

### Option 1: EmailJS (Recommended for Quick Setup)

**Free Tier:** 200 emails/month

1. **Sign up** at https://www.emailjs.com/
2. **Add Email Service:**
   - Go to "Email Services"
   - Click "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the connection instructions

3. **Create Email Template:**
   - Go to "Email Templates"
   - Click "Create New Template"
   - Use this template:

```
Subject: Your NEXT STEP Verification Code

Hello {{to_name}},

Your verification code is: {{otp_code}}

This code will expire in {{expiry_minutes}} minutes.

If you didn't request this code, please ignore this email.

Best regards,
NEXT STEP Team
```

4. **Get Your Credentials:**
   - Service ID (from Email Services page)
   - Template ID (from Email Templates page)
   - Public Key (from Account → General)

5. **Update Configuration:**
   
   Open `email-service.js` and update:
   ```javascript
   emailjs: {
       enabled: true, // Change to true
       serviceId: 'service_xxxxxxx',     // Your Service ID
       templateId: 'template_xxxxxxx',   // Your Template ID
       publicKey: 'YOUR_PUBLIC_KEY'      // Your Public Key
   }
   ```

6. **Add EmailJS Script:**
   
   The script is already included in `signup.html`. If you need to add it elsewhere:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
   ```

### Option 2: Custom Backend API

If you have your own backend API:

1. **Create an endpoint** that accepts:
   ```json
   {
       "to_email": "user@example.com",
       "otp_code": "123456",
       "to_name": "User Name",
       "app_name": "NEXT STEP"
   }
   ```

2. **Update Configuration:**
   ```javascript
   customApi: {
       enabled: true,
       endpoint: 'https://your-api.com/send-otp'
   }
   ```

### Option 3: Supabase Edge Functions

1. **Create Edge Function:**
   ```bash
   supabase functions new send-otp-email
   ```

2. **Implement email sending** using SendGrid, Mailgun, or Resend

3. **Deploy Function:**
   ```bash
   supabase functions deploy send-otp-email
   ```

4. **Update Configuration:**
   ```javascript
   supabaseFunction: {
       enabled: true,
       functionName: 'send-otp-email'
   }
   ```

## Testing in Development

During development (without email service configured):
- OTP will be displayed in an alert popup
- OTP will also be logged to browser console
- This allows testing without setting up email service

## Security Features

✅ **OTP Expiration:** Codes expire after 10 minutes
✅ **Email Lock:** Email field becomes read-only after OTP is sent
✅ **One-Time Use:** OTP is validated only once
✅ **Verification Required:** Signup button disabled until OTP is verified
✅ **Email Confirmation:** Users must verify they own the email address

## User Flow

```
1. User fills in name
2. User enters email address
3. User clicks "Send OTP" → OTP sent to email
4. User checks email inbox
5. User enters 6-digit OTP
6. System validates OTP → Email verified ✓
7. User fills in remaining fields (phone, password)
8. User clicks "Sign Up" → Account created
9. User redirected to Information page
```

## Troubleshooting

### OTP not being sent
- Check browser console for errors
- Verify email service configuration in `email-service.js`
- Ensure EmailJS script is loaded (check Network tab)
- Check EmailJS dashboard for quota limits

### "Invalid OTP" error
- OTP is case-sensitive and must be exactly 6 digits
- Check if OTP has expired (10 minute limit)
- Request a new OTP by clicking "Resend OTP"

### Signup button stays disabled
- Ensure OTP is correctly entered
- Check that email matches the one OTP was sent to
- Verify OTP hasn't expired

### Email not received
- Check spam/junk folder
- Verify email service is configured correctly
- Check EmailJS dashboard for send status
- Ensure email quota hasn't been exceeded

## Production Checklist

Before deploying to production:

- [ ] Configure email service (EmailJS or custom API)
- [ ] Test OTP sending with real emails
- [ ] Verify email template formatting
- [ ] Set up error logging and monitoring
- [ ] Test OTP expiration (wait 10+ minutes)
- [ ] Test "Resend OTP" functionality
- [ ] Verify mobile responsiveness
- [ ] Check spam filter compatibility
- [ ] Set up email delivery monitoring
- [ ] Document email service credentials securely

## Email Template Variables

When creating your email template, use these variables:

- `{{to_email}}` - Recipient email address
- `{{otp_code}}` - 6-digit verification code
- `{{to_name}}` - Recipient name (defaults to email username)
- `{{app_name}}` - Application name ("NEXT STEP")
- `{{expiry_minutes}}` - OTP expiration time ("10")

## Support

For issues with:
- **EmailJS**: https://www.emailjs.com/docs/
- **Supabase Functions**: https://supabase.com/docs/guides/functions
- **This implementation**: Check browser console for detailed error messages
