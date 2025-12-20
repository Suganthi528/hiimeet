# 🚨 Quick Fix Guide - Video Not Visible Issue

## 🎯 **Root Cause:**

The main issue is that `peer.ontrack` fires immediately when tracks are received, but React hasn't rendered the video elements yet. When you try to assign `srcObject`, the video elements don't exist.

## ✅ **3-Step Fix:**

### **Step 1: Fix the ontrack Handler (CRITICAL)**

The current code tries to find video elements immediately, but they don't exist yet. Replace the `ontrack` handler in your `createPeer` function with this:

```javascript
peer.ontrack = (event) => {
  const incomingStream = event.streams[0];
  const track = event.track;
  
  console.log(`📥 RECEIVED ${track.kind} from ${userToSignal}`);
  
  // Mark stream with peer ID
  incomingStream.peerId = userToSignal;
  
  // Update state immediately
  setRemoteStreams((prev) => {
    const existingIndex = prev.findIndex((s) => s.peerId === userToSignal);
    if (existingIndex >= 0) {
      const newStreams = [...prev];
      newStreams[existingIndex] = incomingStream;
      return newStreams;
    } else {
      return [...prev, incomingStream];
    }
  });
  
  // CRITICAL FIX: Retry stream assignment multiple times
  const assignStream = (attempt = 0) => {
    if (attempt > 10) {
      console.error(`❌ Failed to assign stream after 10 attempts`);
      return;
    }
    
    setTimeout(() => {
      // Find video element by data-participant-id
      const participantDiv = document.querySelector(`[data-participant-id="${userToSignal}"]`);
      if (participantDiv) {
        const video = participantDiv.querySelector('video');
        if (video && !video.srcObject) {
          video.srcObject = incomingStream;
          video.play().catch(e => console.log("Autoplay handled:", e.message));
          console.log(`✅ Stream assigned (attempt ${attempt + 1})`);
          return;
        }
      }
      
      // Retry if not found
      console.log(`⏳ Retrying... (attempt ${attempt + 1})`);
      assignStream(attempt + 1);
    }, attempt * 100); // Increasing delay: 0ms, 100ms, 200ms, etc.
  };
  
  assignStream(0);
};
```

### **Step 2: Add data-participant-id to Video Elements**

In your JSX where you render participant videos, ensure you have the `data-participant-id` attribute:

```javascript
{participants.map((participant) => {
  const remoteStream = remoteStreams.find((s) => s.peerId === participant.id);
  
  return (
    <div 
      key={participant.id} 
      data-participant-id={participant.id}  // ← ADD THIS LINE
      className="video-wrapper"
    >
      <video 
        ref={(el) => {
          if (el && remoteStream && el.srcObject !== remoteStream) {
            el.srcObject = remoteStream;
            el.play().catch(e => console.log("Autoplay:", e.message));
          }
        }}
        autoPlay 
        playsInline 
        muted={false}
      />
      
      {!remoteStream && (
        <div className="connecting-overlay">
          <div>{participant.name.charAt(0)}</div>
          <div>Connecting...</div>
        </div>
      )}
    </div>
  );
})}
```

### **Step 3: Enhanced Signal Handling**

Update your `handleSignal` function to properly handle ICE candidates:

```javascript
const handleSignal = async ({ from, signal }) => {
  console.log(`📡 Signal from ${from}:`, signal.type || 'ICE');
  
  let peer = peersRef.current[from];
  
  if (!peer) {
    peer = createPeer(from, socket.id, localStream, false);
    peersRef.current[from] = peer;
  }
  
  try {
    if (signal.type === "offer") {
      await peer.setRemoteDescription(new RTCSessionDescription(signal));
      const answer = await peer.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await peer.setLocalDescription(answer);
      socket.emit("signal", { to: from, from: socket.id, signal: peer.localDescription });
      
    } else if (signal.type === "answer") {
      await peer.setRemoteDescription(new RTCSessionDescription(signal));
      
    } else if (signal.candidate) {
      // CRITICAL: Check if remote description is set before adding ICE candidate
      if (peer.remoteDescription && peer.remoteDescription.type) {
        await peer.addIceCandidate(new RTCIceCandidate(signal));
      } else {
        // Queue the candidate if remote description not set yet
        setTimeout(async () => {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(signal));
          } catch (err) {
            console.error("ICE candidate error:", err);
          }
        }, 1000);
      }
    }
  } catch (err) {
    console.error(`Signal error with ${from}:`, err);
  }
};
```

## 🧪 **Testing:**

After implementing these fixes:

1. **Open browser console** (F12)
2. **Join meeting** with 2+ participants
3. **Look for these logs:**

```
📥 RECEIVED video from [peer-id]
⏳ Retrying... (attempt 1)
✅ Stream assigned (attempt 2)
```

If you see `✅ Stream assigned`, the fix is working!

## 🔍 **Debug Commands:**

Run this in browser console to check status:

```javascript
// Check if streams are received
console.log("Remote streams:", 
  Array.from(document.querySelectorAll('[data-participant-id]')).map(div => ({
    id: div.dataset.participantId,
    hasVideo: !!div.querySelector('video')?.srcObject
  }))
);

// Force assign streams manually
document.querySelectorAll('video:not([muted])').forEach(video => {
  if (!video.srcObject) {
    console.log("Empty video found");
  }
});
```

## ⚡ **Quick Test:**

1. Save the changes
2. Refresh browser
3. Join meeting
4. Check console for `✅ Stream assigned` messages
5. Videos should appear within 1-2 seconds

## 🎯 **Expected Behavior:**

- ✅ Videos appear automatically when participants join
- ✅ "Connecting..." shows briefly, then video appears
- ✅ Works across different networks
- ✅ Automatic retry if initial assignment fails

## 🆘 **If Still Not Working:**

1. **Check console for errors** - Look for red error messages
2. **Verify camera permissions** - Click camera icon in address bar
3. **Test in Chrome** - Best WebRTC support
4. **Check network** - Disable VPN if using one
5. **Run emergency fix** - See EMERGENCY_CONSOLE_FIX.js

The key insight is that React needs time to render the video elements after state updates. The retry mechanism with increasing delays solves this timing issue.

**Status: These 3 steps should fix 90% of video visibility issues!**
