# Password Reset Server Setup

## Prerequisites
You need Node.js installed. Download from: https://nodejs.org

## Setup Steps

### 1. Create package.json
In your project folder (g:\Next Step), create a `package.json` file with:

```json
{
  "name": "next-step-app",
  "version": "1.0.0",
  "description": "NEXT STEP Alumni Platform",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "@supabase/supabase-js": "^2.38.4"
  }
}
```

### 2. Install Dependencies
Open PowerShell in your project folder and run:
```powershell
npm install
```

### 3. Create .env file
Create a `.env` file in your project folder with your Supabase credentials:
```
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_service_key_here
```

### 4. Start the Server
Run:
```powershell
npm start
```

You should see: `Server running on http://localhost:3000`

## Troubleshooting

If you get "npm is not recognized":
- Node.js is not installed or not in your PATH
- Restart PowerShell after installing Node.js

If you get "Error: Cannot find module":
- Run `npm install` again
- Delete `node_modules` folder and `package-lock.json`, then run `npm install`

If port 3000 is already in use:
- Change the PORT in server.js to another port (e.g., 3001)
- Update the frontend URLs in reset-password.js to match
