// 🚨 EMERGENCY VIDEO FIX - Run this in browser console (F12)
// This will force assign remote streams to video elements

console.log("🚨 EMERGENCY VIDEO FIX STARTING...");

// Step 1: Check current state
console.log("📊 CURRENT STATE:");
const localVideos = document.querySelectorAll('video[muted]');
const remoteVideos = document.querySelectorAll('video:not([muted])');
const participantDivs = document.querySelectorAll('[data-participant-id]');

console.log(`- Local videos: ${localVideos.length}`);
console.log(`- Remote videos: ${remoteVideos.length}`);
console.log(`- Participant divs: ${participantDivs.length}`);

// Step 2: Check each video element
console.log("\n📹 VIDEO ELEMENTS:");
document.querySelectorAll('video').forEach((video, index) => {
  console.log(`Video ${index}:`, {
    muted: video.muted,
    hasStream: !!video.srcObject,
    streamId: video.srcObject?.id,
    videoTracks: video.srcObject?.getVideoTracks().length || 0,
    audioTracks: video.srcObject?.getAudioTracks().length || 0,
    readyState: video.readyState,
    paused: video.paused
  });
});

// Step 3: Check participant divs
console.log("\n👥 PARTICIPANT DIVS:");
participantDivs.forEach((div, index) => {
  const participantId = div.dataset.participantId;
  const video = div.querySelector('video');
  console.log(`Participant ${index} (${participantId}):`, {
    hasVideo: !!video,
    videoHasStream: !!video?.srcObject,
    videoReadyState: video?.readyState
  });
});

// Step 4: Try to find streams in global scope or React state
console.log("\n🔍 LOOKING FOR STREAMS...");

// Try to access React component state (this might not work)
let reactStreams = [];
try {
  // Look for React fiber
  const rootElement = document.querySelector('#root');
  if (rootElement && rootElement._reactInternalFiber) {
    console.log("Found React fiber, trying to access state...");
  }
} catch (e) {
  console.log("Could not access React state directly");
}

// Alternative: Look for streams in existing video elements
const existingStreams = [];
document.querySelectorAll('video').forEach(video => {
  if (video.srcObject && !existingStreams.includes(video.srcObject)) {
    existingStreams.push(video.srcObject);
  }
});

console.log(`Found ${existingStreams.length} existing streams`);
existingStreams.forEach((stream, index) => {
  console.log(`Stream ${index}:`, {
    id: stream.id,
    active: stream.active,
    videoTracks: stream.getVideoTracks().length,
    audioTracks: stream.getAudioTracks().length,
    peerId: stream.peerId || 'unknown'
  });
});

// Step 5: EMERGENCY FIX - Force assign streams to empty videos
console.log("\n🔧 EMERGENCY STREAM ASSIGNMENT...");

if (existingStreams.length > 1) {
  // We have multiple streams, try to assign them properly
  const localStream = existingStreams.find(s => 
    document.querySelector('video[muted]')?.srcObject === s
  );
  
  const remoteStreams = existingStreams.filter(s => s !== localStream);
  
  console.log(`Local stream: ${!!localStream}`);
  console.log(`Remote streams: ${remoteStreams.length}`);
  
  // Assign remote streams to empty remote video elements
  const emptyRemoteVideos = Array.from(document.querySelectorAll('video:not([muted])')).filter(v => !v.srcObject);
  
  console.log(`Empty remote videos: ${emptyRemoteVideos.length}`);
  
  remoteStreams.forEach((stream, index) => {
    if (emptyRemoteVideos[index]) {
      console.log(`🔧 Assigning stream ${index} to empty video ${index}`);
      emptyRemoteVideos[index].srcObject = stream;
      emptyRemoteVideos[index].play().then(() => {
        console.log(`✅ SUCCESS: Video ${index} is now playing`);
      }).catch(error => {
        console.log(`⚠️ Play error for video ${index}:`, error.message);
      });
    }
  });
} else {
  console.log("❌ Not enough streams found for assignment");
}

// Step 6: Alternative fix - Try getUserMedia for each empty video
console.log("\n🎥 ALTERNATIVE FIX - Testing camera access...");

async function testCameraForEmptyVideos() {
  const emptyVideos = Array.from(document.querySelectorAll('video:not([muted])')).filter(v => !v.srcObject);
  
  if (emptyVideos.length > 0) {
    try {
      console.log("📹 Testing camera access...");
      const testStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      console.log("✅ Camera access successful!");
      
      // Assign test stream to first empty video
      if (emptyVideos[0]) {
        emptyVideos[0].srcObject = testStream;
        emptyVideos[0].play().then(() => {
          console.log("✅ Test stream assigned and playing");
        }).catch(e => {
          console.log("⚠️ Test stream play error:", e.message);
        });
      }
      
    } catch (error) {
      console.error("❌ Camera test failed:", error);
      
      let errorMessage = "Camera access failed: ";
      if (error.name === 'NotAllowedError') {
        errorMessage += "Permission denied. Please allow camera access.";
      } else if (error.name === 'NotFoundError') {
        errorMessage += "No camera found.";
      } else if (error.name === 'NotReadableError') {
        errorMessage += "Camera is being used by another application.";
      } else {
        errorMessage += error.message;
      }
      
      console.log("❌ " + errorMessage);
    }
  }
}

// Run the camera test
testCameraForEmptyVideos();

// Step 7: Final status check
setTimeout(() => {
  console.log("\n📊 FINAL STATUS:");
  const workingVideos = Array.from(document.querySelectorAll('video')).filter(v => 
    v.srcObject && v.readyState >= 2 && !v.paused
  );
  
  console.log(`Working videos: ${workingVideos.length}/${document.querySelectorAll('video').length}`);
  
  if (workingVideos.length === document.querySelectorAll('video').length) {
    console.log("🎉 SUCCESS: All videos are working!");
    alert("🎉 SUCCESS: All videos should now be visible!");
  } else {
    console.log("⚠️ Some videos still not working");
    
    // Show which videos are not working
    document.querySelectorAll('video').forEach((video, i) => {
      if (!video.srcObject || video.readyState < 2 || video.paused) {
        console.log(`❌ Video ${i} not working:`, {
          hasStream: !!video.srcObject,
          readyState: video.readyState,
          paused: video.paused,
          muted: video.muted
        });
      }
    });
    
    alert("⚠️ Some videos still not working. Check console for details.");
  }
}, 3000);

console.log("\n🚨 EMERGENCY FIX COMPLETED. Check results above and wait 3 seconds for final status.");