# 🚨 Video Not Visible - Emergency Troubleshooting Guide

## 📋 **Current Issue:**
- Host video is visible (sangi)
- Other participants (Mega, Mabi) show "Connecting..." but no video
- Video grid appears but participant videos are black

## 🔍 **Step 1: Open Browser Console**

Press `F12` or `Ctrl+Shift+I` to open Developer Tools, then click on the "Console" tab.

## 🔍 **Step 2: Check These Console Logs**

Look for these specific messages in the console:

### **A. Local Stream Check:**
```
🎥 CRITICAL: Starting media BEFORE joining room...
✅ Media stream obtained successfully!
```
- If you see this, local media is working ✅
- If NOT, camera permissions are blocked ❌

### **B. Peer Connection Creation:**
```
🔗 Creating peer connection: [socket-id] -> [peer-id] (initiator: true)
📡 Added video track to peer [peer-id]
📡 Added audio track to peer [peer-id]
```
- If you see this, peer connections are being created ✅
- If NOT, peers are not being created properly ❌

### **C. Track Reception:**
```
📥 Received video track from [peer-id]
📥 Received audio track from [peer-id]
```
- If you see this, tracks are being received ✅
- If NOT, WebRTC negotiation failed ❌

### **D. ICE Connection:**
```
🧊 ICE connection state with [peer-id]: connected
✅ Successfully connected to [peer-id]
```
- If you see this, ICE connection is established ✅
- If NOT, network/firewall issue ❌

## 🔧 **Step 3: Emergency Fixes**

### **Fix 1: Check Camera Permissions**
1. Click the camera icon in browser address bar
2. Ensure camera and microphone are "Allowed"
3. Refresh the page and rejoin

### **Fix 2: Check Network/Firewall**
1. Disable VPN if using one
2. Check if firewall is blocking WebRTC
3. Try a different network

### **Fix 3: Manual Console Commands**

Open browser console and run these commands:

```javascript
// 1. Check local stream
console.log("Local Stream:", window.localStream || "NOT AVAILABLE");

// 2. Check participants
console.log("Participants:", window.participants || "NOT AVAILABLE");

// 3. Check remote streams
console.log("Remote Streams:", window.remoteStreams || "NOT AVAILABLE");

// 4. Check peer connections
console.log("Peer Connections:", Object.keys(window.peersRef?.current || {}));

// 5. Force assign streams to videos
document.querySelectorAll('video').forEach((video, i) => {
  console.log(`Video ${i}:`, {
    hasStream: !!video.srcObject,
    readyState: video.readyState,
    paused: video.paused
  });
});
```

### **Fix 4: Emergency Stream Assignment**

If streams are received but not displayed, run this in console:

```javascript
// Get all video elements
const videos = document.querySelectorAll('video');

// Get remote streams (you'll need to access from React state)
// This is a workaround - normally handled by React

// Force play all videos
videos.forEach(video => {
  if (video.srcObject) {
    video.play().catch(e => console.log("Play error:", e));
  }
});
```

## 🎯 **Step 4: Identify the Problem**

Based on console logs, identify which stage is failing:

### **Problem A: No Local Stream**
**Symptoms:**
- No "Media stream obtained successfully" message
- Camera permission denied

**Solution:**
1. Allow camera/microphone permissions
2. Refresh page
3. Rejoin meeting

### **Problem B: Peer Connections Not Created**
**Symptoms:**
- No "Creating peer connection" messages
- No peer connections in console

**Solution:**
1. Check if Socket.IO is connected
2. Look for "all-users" or "user-joined" events
3. Verify backend is running

### **Problem C: Tracks Not Received**
**Symptoms:**
- Peer connections created
- But no "Received track" messages

**Solution:**
1. Check if offer/answer exchange is happening
2. Look for "Sending offer" and "Processing answer" messages
3. Verify signaling server is working

### **Problem D: ICE Connection Failed**
**Symptoms:**
- "ICE connection state: failed" messages
- Connection never reaches "connected" state

**Solution:**
1. Check network/firewall settings
2. Disable VPN
3. Try different network
4. May need TURN server for restrictive networks

### **Problem E: Streams Received But Not Displayed**
**Symptoms:**
- "Received track" messages appear
- Remote streams array has items
- But videos still black

**Solution:**
1. Check if video elements have `srcObject` assigned
2. Run emergency stream assignment (Fix 4 above)
3. Check if videos are paused

## 📊 **Step 5: Detailed Diagnostics**

Run this comprehensive diagnostic in console:

```javascript
console.log("=== COMPREHENSIVE WEBRTC DIAGNOSTIC ===");

// 1. Local Stream
const localVideo = document.querySelector('video[muted]');
console.log("1. LOCAL STREAM:", {
  videoElement: !!localVideo,
  hasStream: !!localVideo?.srcObject,
  tracks: localVideo?.srcObject?.getTracks().length || 0
});

// 2. Remote Videos
const remoteVideos = Array.from(document.querySelectorAll('video:not([muted])'));
console.log("2. REMOTE VIDEOS:", remoteVideos.map((v, i) => ({
  index: i,
  hasStream: !!v.srcObject,
  streamId: v.srcObject?.id,
  videoTracks: v.srcObject?.getVideoTracks().length || 0,
  audioTracks: v.srcObject?.getAudioTracks().length || 0,
  readyState: v.readyState,
  paused: v.paused
})));

// 3. Participant Divs
const participantDivs = document.querySelectorAll('[data-participant-id]');
console.log("3. PARTICIPANT DIVS:", participantDivs.length);

console.log("=== END DIAGNOSTIC ===");
```

## 🚀 **Step 6: Quick Fixes to Try**

### **Quick Fix 1: Refresh and Rejoin**
1. Leave meeting
2. Refresh browser (F5)
3. Rejoin meeting
4. Allow camera/mic permissions again

### **Quick Fix 2: Different Browser**
1. Try Chrome (best WebRTC support)
2. Try Firefox
3. Avoid Safari (limited WebRTC support)

### **Quick Fix 3: Incognito Mode**
1. Open browser in incognito/private mode
2. Join meeting
3. This bypasses extensions that might interfere

### **Quick Fix 4: Clear Cache**
1. Clear browser cache and cookies
2. Restart browser
3. Rejoin meeting

## 📝 **Step 7: Report Issue**

If none of the above works, collect this information:

1. **Browser:** Chrome/Firefox/Safari + version
2. **OS:** Windows/Mac/Linux
3. **Console Errors:** Copy all red error messages
4. **Network:** Behind firewall? Using VPN?
5. **Console Logs:** Copy the diagnostic output from Step 5

## 🎯 **Most Common Issues & Solutions:**

| Issue | Cause | Solution |
|-------|-------|----------|
| Black video | Camera permissions denied | Allow permissions in browser |
| "Connecting..." forever | ICE connection failed | Check network/firewall |
| No peer connections | Socket.IO not connected | Check backend server |
| Tracks not received | Signaling failed | Check offer/answer exchange |
| Videos not assigned | React state issue | Run emergency stream assignment |

## ✅ **Expected Working State:**

When everything works correctly, you should see:

```
🎥 CRITICAL: Starting media BEFORE joining room...
✅ Media stream obtained successfully!
🔗 Creating peer connection: [id1] -> [id2] (initiator: true)
📡 Added video track to peer [id2]
📡 Added audio track to peer [id2]
🤝 Starting negotiation with [id2]
📤 Offer sent to [id2]
📥 Received signal from [id2]: answer
✅ Answer processed for [id2]
🧊 ICE connection state with [id2]: connected
✅ Successfully connected to [id2]
📥 Received video track from [id2]
📥 Received audio track from [id2]
✅ Stream assigned to video element for [id2]
```

## 🆘 **Emergency Contact:**

If you're still stuck, please provide:
1. Screenshot of browser console
2. Screenshot of Network tab (F12 → Network)
3. Browser and OS information
4. Any error messages

**Status: Use this guide to diagnose and fix video visibility issues!**
