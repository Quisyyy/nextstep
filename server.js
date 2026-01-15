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

// API endpoint for password reset
app.post('/reset-password-api', require('./reset-password-api'));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
