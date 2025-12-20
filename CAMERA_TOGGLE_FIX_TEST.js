// 🎥 CAMERA TOGGLE FIX TEST - Run this in browser console
// This will test if the camera toggle fix is working properly

console.log("🎥 CAMERA TOGGLE FIX TEST STARTING...");

// Function to check current camera state
function checkCameraState() {
  const localVideo = document.querySelector('video[muted]');
  const localStream = localVideo?.srcObject;
  
  console.log("📊 CURRENT CAMERA STATE:");
  console.log(`- Local video element exists: ${!!localVideo}`);
  console.log(`- Local stream exists: ${!!localStream}`);
  
  if (localStream) {
    const videoTracks = localStream.getVideoTracks();
    console.log(`- Video tracks: ${videoTracks.length}`);
    
    videoTracks.forEach((track, i) => {
      console.log(`  Track ${i}:`, {
        id: track.id,
        enabled: track.enabled,
        readyState: track.readyState,
        muted: track.muted,
        label: track.label
      });
    });
  }
  
  return { localVideo, localStream };
}

// Function to test camera toggle
async function testCameraToggle() {
  console.log("\n🧪 TESTING CAMERA TOGGLE...");
  
  const { localVideo, localStream } = checkCameraState();
  
  if (!localStream) {
    console.log("❌ No local stream found. Cannot test camera toggle.");
    return;
  }
  
  const videoTracks = localStream.getVideoTracks();
  if (videoTracks.length === 0) {
    console.log("❌ No video tracks found. Cannot test camera toggle.");
    return;
  }
  
  const originalEnabled = videoTracks[0].enabled;
  console.log(`📹 Original camera state: ${originalEnabled ? 'ON' : 'OFF'}`);
  
  // Test 1: Toggle camera off
  console.log("🔄 Test 1: Turning camera OFF...");
  videoTracks.forEach(track => {
    track.enabled = false;
  });
  
  setTimeout(() => {
    console.log("📊 After turning OFF:");
    checkCameraState();
    
    // Test 2: Toggle camera back on
    console.log("🔄 Test 2: Turning camera ON...");
    videoTracks.forEach(track => {
      track.enabled = true;
    });
    
    setTimeout(() => {
      console.log("📊 After turning ON:");
      checkCameraState();
      
      // Test 3: Check if video is actually visible
      setTimeout(() => {
        if (localVideo && localVideo.videoWidth > 0 && localVideo.videoHeight > 0) {
          console.log("✅ SUCCESS: Camera toggle working - video is visible");
          console.log(`📐 Video dimensions: ${localVideo.videoWidth}x${localVideo.videoHeight}`);
          alert("✅ Camera toggle test PASSED! Video should be visible after toggle.");
        } else {
          console.log("❌ FAILED: Camera toggle not working - video not visible");
          console.log("🔧 Trying to fix with fresh stream...");
          
          // Emergency fix: Get fresh stream
          navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(freshStream => {
              if (localVideo) {
                localVideo.srcObject = freshStream;
                localVideo.play();
                console.log("✅ Applied fresh stream to local video");
                alert("🔧 Applied emergency fix - camera should now be visible");
              }
            })
            .catch(e => {
              console.error("❌ Emergency fix failed:", e);
              alert("❌ Camera toggle test FAILED. Check console for details.");
            });
        }
      }, 1000);
    }, 1000);
  }, 1000);
}

// Function to test peer connection track replacement
function testPeerTrackReplacement() {
  console.log("\n🔗 TESTING PEER CONNECTION TRACK REPLACEMENT...");
  
  // Check if we have access to peer connections
  if (typeof window.peersRef === 'undefined') {
    console.log("❌ Cannot access peer connections. This test needs to be run from the app context.");
    return;
  }
  
  const peers = window.peersRef?.current || {};
  const peerCount = Object.keys(peers).length;
  
  console.log(`📊 Found ${peerCount} peer connections`);
  
  Object.entries(peers).forEach(([peerId, peer]) => {
    const senders = peer.getSenders();
    const videoSender = senders.find(s => s.track?.kind === 'video');
    
    console.log(`Peer ${peerId}:`, {
      connectionState: peer.connectionState,
      iceConnectionState: peer.iceConnectionState,
      hasVideoSender: !!videoSender,
      videoTrackEnabled: videoSender?.track?.enabled
    });
  });
}

// Run the tests
console.log("🚀 Starting camera toggle tests...");

// Test 1: Check initial state
checkCameraState();

// Test 2: Test camera toggle functionality
testCameraToggle();

// Test 3: Test peer connections (if available)
setTimeout(() => {
  testPeerTrackReplacement();
}, 5000);

console.log("\n📋 CAMERA TOGGLE FIX TEST INSTRUCTIONS:");
console.log("1. Watch the console output above");
console.log("2. Check if your local video turns off and on");
console.log("3. Ask other participants if they can see your video toggle");
console.log("4. If test fails, the fix will attempt an emergency repair");

console.log("\n🎥 CAMERA TOGGLE FIX TEST COMPLETED");
console.log("Check the results above and test manually by clicking the camera button.");