# 🎥 Camera Test Instructions - Fix Video Not Visible

## 🚨 **Immediate Steps to Test:**

### **Step 1: Test Camera Permissions**

1. **Open browser console** (Press F12, click Console tab)
2. **Run this test code** (copy and paste, then press Enter):

```javascript
// Test camera access
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    console.log("✅ Camera access successful!", {
      videoTracks: stream.getVideoTracks().length,
      audioTracks: stream.getAudioTracks().length
    });
    
    // Test video element assignment
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.muted = true;
    video.style.width = '200px';
    video.style.height = '150px';
    video.style.position = 'fixed';
    video.style.top = '10px';
    video.style.right = '10px';
    video.style.zIndex = '9999';
    video.style.border = '2px solid green';
    document.body.appendChild(video);
    
    console.log("✅ Test video element added to page");
    alert("✅ Camera test successful! You should see a small video in the top-right corner.");
  })
  .catch(error => {
    console.error("❌ Camera test failed:", error);
    
    let message = "Camera test failed: ";
    if (error.name === 'NotAllowedError') {
      message += "Permission denied. Click the camera icon in the address bar and allow access.";
    } else if (error.name === 'NotFoundError') {
      message += "No camera found. Please connect a camera.";
    } else if (error.name === 'NotReadableError') {
      message += "Camera is being used by another application.";
    } else {
      message += error.message;
    }
    
    alert("❌ " + message);
  });
```

### **Step 2: Check Browser Permissions**

1. **Look at the address bar** - you should see a camera icon
2. **Click the camera icon** 
3. **Ensure both Camera and Microphone are set to "Allow"**
4. **Refresh the page** if you changed permissions

### **Step 3: Test in Different Browser**

If the test fails:
1. **Try Chrome** (best WebRTC support)
2. **Try Firefox** 
3. **Avoid Safari** (limited WebRTC support)

### **Step 4: Test the Meeting**

1. **Join the meeting** 
2. **Check browser console** for these messages:
   ```
   🚀 AUTO-STARTING media for meeting...
   📹 Requesting getUserMedia with constraints:
   ✅ Media stream obtained successfully!
   ✅ Local video assigned to video element
   ```

3. **If you see errors**, look for:
   - `NotAllowedError` = Permission denied
   - `NotFoundError` = No camera found
   - `NotReadableError` = Camera in use by another app

### **Step 5: Manual Camera Enable**

If camera doesn't start automatically:

1. **Click the "Enable Camera" button** in the meeting
2. **Allow permissions** when prompted
3. **Check console** for success messages

## 🔧 **Common Issues & Solutions:**

### **Issue 1: Permission Denied**
**Symptoms:** `NotAllowedError` in console
**Solution:** 
1. Click camera icon in address bar
2. Set to "Allow" 
3. Refresh page

### **Issue 2: Camera in Use**
**Symptoms:** `NotReadableError` in console
**Solution:**
1. Close other video apps (Zoom, Teams, etc.)
2. Restart browser
3. Try again

### **Issue 3: No Camera Found**
**Symptoms:** `NotFoundError` in console
**Solution:**
1. Check camera is connected
2. Try different USB port
3. Check camera works in other apps

### **Issue 4: Browser Not Supported**
**Symptoms:** `getUserMedia not supported` error
**Solution:**
1. Use Chrome or Firefox
2. Update browser to latest version
3. Enable camera permissions in browser settings

## 🎯 **Expected Working State:**

When everything works correctly:

1. **Console shows:**
   ```
   ✅ Camera access successful! { videoTracks: 1, audioTracks: 1 }
   ✅ Media stream obtained successfully!
   ✅ Local video assigned to video element
   ```

2. **You should see:**
   - Your video in the meeting interface
   - Green "Camera ON" indicator
   - Other participants can see your video

3. **Browser address bar:**
   - Camera icon shows "allowed"
   - No red "blocked" indicators

## 🆘 **If Still Not Working:**

### **Emergency Console Commands:**

Run these in browser console to force camera:

```javascript
// Force camera test
async function forceCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
    // Find local video element
    const localVideo = document.querySelector('video[muted]');
    if (localVideo) {
      localVideo.srcObject = stream;
      localVideo.play();
      console.log("✅ Forced camera to local video");
    }
    
    return stream;
  } catch (error) {
    console.error("❌ Force camera failed:", error);
    throw error;
  }
}

// Run the test
forceCamera();
```

### **Check Video Elements:**

```javascript
// Check all video elements
document.querySelectorAll('video').forEach((video, i) => {
  console.log(`Video ${i}:`, {
    muted: video.muted,
    hasStream: !!video.srcObject,
    readyState: video.readyState,
    paused: video.paused
  });
});
```

## 📱 **Mobile Testing:**

If testing on mobile:
1. **Use Chrome mobile** (best support)
2. **Allow camera permissions** when prompted
3. **Rotate to landscape** for better view
4. **Ensure good network connection**

## ✅ **Success Indicators:**

You'll know it's working when:
- ✅ Test video appears in top-right corner
- ✅ Console shows "Camera access successful"
- ✅ Meeting shows your video instead of "Camera is Off"
- ✅ Other participants can see your video

## 🔄 **Next Steps:**

Once camera is working:
1. **Test with multiple participants**
2. **Verify remote videos are visible**
3. **Test camera toggle on/off**
4. **Test in different network conditions**

**Run the camera test first - this will tell us exactly what's wrong!**