// 🚨 EMERGENCY VIDEO FIX - Run this in browser console (F12)
// Copy and paste this entire code block into the console and press Enter

console.log("🚨 EMERGENCY VIDEO FIX STARTING...");

// 1. Check current state
console.log("📊 CURRENT STATE:");
console.log("- Local videos:", document.querySelectorAll('video[muted]').length);
console.log("- Remote videos:", document.querySelectorAll('video:not([muted])').length);
console.log("- Participant divs:", document.querySelectorAll('[data-participant-id]').length);

// 2. Get all video elements
const allVideos = document.querySelectorAll('video');
console.log("📹 Found", allVideos.length, "video elements");

// 3. Check each video element
allVideos.forEach((video, index) => {
  console.log(`Video ${index}:`, {
    muted: video.muted,
    hasStream: !!video.srcObject,
    streamId: video.srcObject?.id,
    videoTracks: video.srcObject?.getVideoTracks().length || 0,
    audioTracks: video.srcObject?.getAudioTracks().length || 0,
    readyState: video.readyState,
    paused: video.paused,
    autoplay: video.autoplay
  });
});

// 4. Try to access React state (this might not work depending on React version)
let reactState = null;
try {
  // Try to find React fiber
  const videoRoom = document.querySelector('#root');
  if (videoRoom && videoRoom._reactInternalFiber) {
    // React 16
    reactState = videoRoom._reactInternalFiber;
  } else if (videoRoom && videoRoom._reactInternalInstance) {
    // React 15
    reactState = videoRoom._reactInternalInstance;
  }
  console.log("React state access:", !!reactState);
} catch (e) {
  console.log("Could not access React state:", e.message);
}

// 5. Emergency fix: Force all videos to play
console.log("🔧 EMERGENCY FIX: Forcing all videos to play...");
allVideos.forEach((video, index) => {
  if (video.srcObject) {
    video.play().then(() => {
      console.log(`✅ Video ${index} playing`);
    }).catch(error => {
      console.log(`⚠️ Video ${index} play error:`, error.message);
    });
  } else {
    console.log(`⚠️ Video ${index} has no stream`);
  }
});

// 6. Check for getUserMedia streams in global scope
console.log("🔍 Checking for global streams...");
if (window.localStream) {
  console.log("✅ Found window.localStream:", window.localStream);
} else {
  console.log("❌ No window.localStream found");
}

// 7. Try to find streams in MediaStream registry
console.log("🔍 Checking MediaStream instances...");
const mediaStreams = [];
try {
  // This is a hack to find all MediaStream instances
  const originalMediaStream = window.MediaStream;
  if (originalMediaStream) {
    console.log("MediaStream constructor available");
  }
} catch (e) {
  console.log("MediaStream check error:", e.message);
}

// 8. Emergency stream assignment
console.log("🚨 EMERGENCY STREAM ASSIGNMENT...");

// Try to find any MediaStream objects in the page
const findStreams = () => {
  const streams = [];
  
  // Check all video elements for streams
  document.querySelectorAll('video').forEach(video => {
    if (video.srcObject && !streams.includes(video.srcObject)) {
      streams.push(video.srcObject);
    }
  });
  
  return streams;
};

const availableStreams = findStreams();
console.log("📡 Found", availableStreams.length, "unique streams");

availableStreams.forEach((stream, index) => {
  console.log(`Stream ${index}:`, {
    id: stream.id,
    active: stream.active,
    videoTracks: stream.getVideoTracks().length,
    audioTracks: stream.getAudioTracks().length,
    peerId: stream.peerId || 'unknown'
  });
});

// 9. Try to assign streams to empty video elements
const emptyVideos = Array.from(document.querySelectorAll('video')).filter(v => !v.srcObject && !v.muted);
console.log("📹 Found", emptyVideos.length, "empty video elements");

if (availableStreams.length > 1 && emptyVideos.length > 0) {
  console.log("🔧 Attempting to assign streams to empty videos...");
  
  // Skip the first stream (likely local) and assign others
  const remoteStreams = availableStreams.slice(1);
  
  remoteStreams.forEach((stream, index) => {
    if (emptyVideos[index]) {
      emptyVideos[index].srcObject = stream;
      emptyVideos[index].play().then(() => {
        console.log(`✅ EMERGENCY: Assigned stream to video ${index}`);
      }).catch(e => {
        console.log(`⚠️ EMERGENCY: Play error for video ${index}:`, e.message);
      });
    }
  });
} else {
  console.log("❌ Cannot assign streams - not enough streams or empty videos");
}

// 10. Final status check
setTimeout(() => {
  console.log("📊 FINAL STATUS CHECK:");
  const workingVideos = Array.from(document.querySelectorAll('video')).filter(v => 
    v.srcObject && v.readyState >= 2 && !v.paused
  );
  console.log(`✅ Working videos: ${workingVideos.length}/${allVideos.length}`);
  
  if (workingVideos.length === allVideos.length) {
    console.log("🎉 SUCCESS: All videos are working!");
  } else {
    console.log("⚠️ Some videos still not working. Check the troubleshooting guide.");
  }
}, 2000);

console.log("🚨 EMERGENCY FIX COMPLETED. Check results above.");