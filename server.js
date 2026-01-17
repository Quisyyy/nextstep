// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Secure endpoint to provide Supabase configuration
// This keeps the API key server-side and only exposes it via a controlled endpoint
app.get('/api/supabase-config', (req, res) => {
    // In production, these should be in environment variables
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ziquhxrfxywsmvunuyzi.supabase.co';
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcXVoeHJmeHl3c212dW51eXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNjM1NzQsImV4cCI6MjA3NzczOTU3NH0.IXCfC4IwcyJ5jv2jfDP2ZYfPCXUPS88kCupj0DMoVqc';
    
    res.json({
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    });
});

// API endpoint for password reset
app.post('/reset-password-api', require('./reset-password-api'));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
