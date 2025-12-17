# 🔧 Fix "Invalid Host Header" Error with ngrok

## 🎯 Problem
When deploying React frontend through ngrok, you get "Invalid Host Header" error because webpack dev server blocks requests from unknown hosts for security.

## ✅ Solutions (Choose One)

### **Solution 1: Disable Host Check (Recommended for Development)**

Update your `package.json` start script:

```json
{
  "scripts": {
    "start": "DANGEROUSLY_DISABLE_HOST_CHECK=true react-scripts start",
    "start-ngrok": "DANGEROUSLY_DISABLE_HOST_CHECK=true react-scripts start"
  }
}
```

**For Windows:**
```json
{
  "scripts": {
    "start": "set DANGEROUSLY_DISABLE_HOST_CHECK=true && react-scripts start",
    "start-ngrok": "set DANGEROUSLY_DISABLE_HOST_CHECK=true && react-scripts start"
  }
}
```

### **Solution 2: Create .env File (Preferred)**

Create a `.env` file in your `video-meet` directory:

```env
DANGEROUSLY_DISABLE_HOST_CHECK=true
GENERATE_SOURCEMAP=false
```

### **Solution 3: Use --host Flag**

Update package.json:
```json
{
  "scripts": {
    "start": "react-scripts start --host 0.0.0.0",
    "start-ngrok": "react-scripts start --host 0.0.0.0"
  }
}
```

### **Solution 4: Configure Allowed Hosts**

Create `.env` file with specific host:
```env
DANGEROUSLY_DISABLE_HOST_CHECK=true
WDS_SOCKET_HOST=0.0.0.0
WDS_SOCKET_PORT=3000
```

## 🚀 Complete Setup Steps

### **Step 1: Choose and Apply Fix**
Pick one of the solutions above and apply it.

### **Step 2: Update Socket Connection for ngrok**

In `video-meet/src/Videoroom.js`, update the socket connection to work with ngrok:

```javascript
// Current connection (localhost only)
const socket = io("http://localhost:5000", {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Updated for ngrok deployment
const socket = io(process.env.REACT_APP_BACKEND_URL || "http://localhost:5000", {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

### **Step 3: Update .env File**

Add backend URL to `.env`:
```env
DANGEROUSLY_DISABLE_HOST_CHECK=true
REACT_APP_BACKEND_URL=https://your-backend-ngrok-url.ngrok.io
```

### **Step 4: Deploy with ngrok**

```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start backend ngrok tunnel
ngrok http 5000

# Terminal 3: Start frontend (with host check disabled)
cd video-meet
npm start

# Terminal 4: Start frontend ngrok tunnel
ngrok http 3000
```

## 🔧 Alternative: Production Build Method

### **For Production Deployment:**

```bash
# Build the React app
cd video-meet
npm run build

# Serve the build folder
npx serve -s build -p 3000

# Then use ngrok
ngrok http 3000
```

## 📝 Complete Configuration Files

### **video-meet/.env**
```env
DANGEROUSLY_DISABLE_HOST_CHECK=true
GENERATE_SOURCEMAP=false
REACT_APP_BACKEND_URL=https://your-backend-ngrok-url.ngrok.io
```

### **video-meet/package.json** (Updated Scripts)
```json
{
  "scripts": {
    "start": "react-scripts start",
    "start-ngrok": "DANGEROUSLY_DISABLE_HOST_CHECK=true react-scripts start",
    "build": "react-scripts build",
    "serve": "npx serve -s build -p 3000"
  }
}
```

### **Updated Socket Connection**
```javascript
// In video-meet/src/Videoroom.js
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

## 🌐 Complete ngrok Deployment Process

### **Step-by-Step Deployment:**

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Expose Backend via ngrok:**
   ```bash
   ngrok http 5000
   ```
   Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

3. **Update Frontend .env:**
   ```env
   DANGEROUSLY_DISABLE_HOST_CHECK=true
   REACT_APP_BACKEND_URL=https://abc123.ngrok.io
   ```

4. **Start Frontend:**
   ```bash
   cd video-meet
   npm run start-ngrok
   ```

5. **Expose Frontend via ngrok:**
   ```bash
   ngrok http 3000
   ```

6. **Access Your App:**
   Use the frontend ngrok URL to access your video meeting app.

## ⚠️ Security Notes

- `DANGEROUSLY_DISABLE_HOST_CHECK=true` should only be used in development
- For production, use proper domain configuration
- ngrok free tier has limitations on concurrent connections

## 🔍 Troubleshooting

### **If Still Getting Host Header Error:**
1. Clear browser cache
2. Restart React dev server
3. Check .env file is in correct location
4. Verify environment variable is loaded: `console.log(process.env.REACT_APP_BACKEND_URL)`

### **If Socket Connection Fails:**
1. Ensure backend ngrok URL is correct in .env
2. Check CORS settings in backend
3. Verify both frontend and backend ngrok tunnels are running

## ✅ Expected Result

After applying the fix:
- ✅ No more "Invalid Host Header" error
- ✅ React app loads through ngrok URL
- ✅ Socket connection works with backend
- ✅ Video meeting functionality works remotely

Choose **Solution 2 (.env file)** for the cleanest approach!