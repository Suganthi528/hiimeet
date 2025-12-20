// 🚨 INSTANT VIDEO FIX - Run this in browser console NOW
// This will immediately fix the participant video visibility issue

console.log("🚨 INSTANT VIDEO FIX STARTING...");

// Step 1: Check current state
const localVideos = document.querySelectorAll('video[muted]');
const remoteVideos = document.querySelectorAll('video:not([muted])');
const participantDivs = document.querySelectorAll('[data-participant-id]');

console.log(`📊 Current state:`);
console.log(`- Local videos: ${localVideos.length}`);
console.log(`- Remote videos: ${remoteVideos.length}`);
console.log(`- Participant divs: ${participantDivs.length}`);

// Step 2: Find all existing streams
const allStreams = [];
document.querySelectorAll('video').forEach(video => {
  if (video.srcObject && !allStreams.includes(video.srcObject)) {
    allStreams.push(video.srcObject);
    console.log(`📡 Found stream: ${video.srcObject.id} (video tracks: ${video.srcObject.getVideoTracks().length})`);
  }
});

console.log(`📡 Total streams found: ${allStreams.length}`);

// Step 3: Check which remote videos are empty
const emptyRemoteVideos = Array.from(remoteVideos).filter(v => !v.srcObject);
console.log(`📹 Empty remote videos: ${emptyRemoteVideos.length}`);

// Step 4: INSTANT FIX - Assign streams to empty videos
if (allStreams.length > 1 && emptyRemoteVideos.length > 0) {
  console.log("🔧 APPLYING INSTANT FIX...");
  
  // Skip the first stream (likely local) and assign others to empty remote videos
  const remoteStreams = allStreams.slice(1);
  
  remoteStreams.forEach((stream, index) => {
    if (emptyRemoteVideos[index]) {
      console.log(`🎥 Assigning stream ${index} to empty video ${index}`);
      emptyRemoteVideos[index].srcObject = stream;
      emptyRemoteVideos[index].play().then(() => {
        console.log(`✅ SUCCESS: Video ${index} is now playing!`);
      }).catch(error => {
        console.log(`⚠️ Play error for video ${index}:`, error.message);
      });
    }
  });
  
  // Wait 2 seconds and check results
  setTimeout(() => {
    const workingVideos = Array.from(remoteVideos).filter(v => v.srcObject && v.readyState >= 2);
    console.log(`📊 RESULTS: ${workingVideos.length}/${remoteVideos.length} remote videos now working`);
    
    if (workingVideos.length === remoteVideos.length) {
      console.log("🎉 SUCCESS: All participant videos should now be visible!");
      alert("🎉 SUCCESS: Participant videos fixed! You should see all videos now.");
    } else {
      console.log("⚠️ Some videos still not working, trying alternative fix...");
      
      // Alternative fix: Try to get fresh streams
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(testStream => {
            const stillEmptyVideos = Array.from(remoteVideos).filter(v => !v.srcObject);
            if (stillEmptyVideos.length > 0) {
              stillEmptyVideos[0].srcObject = testStream;
              stillEmptyVideos[0].play();
              console.log("✅ Applied test stream to empty video");
            }
          })
          .catch(e => console.log("❌ Could not get test stream:", e.message));
      }
    }
  }, 2000);
  
} else {
  console.log("❌ Cannot apply fix - not enough streams or no empty videos");
  console.log(`Streams: ${allStreams.length}, Empty videos: ${emptyRemoteVideos.length}`);
  
  // Try to diagnose the issue
  console.log("\n🔍 DIAGNOSIS:");
  
  if (allStreams.length <= 1) {
    console.log("❌ ISSUE: Not enough streams found");
    console.log("This means remote participants are not sending video streams");
    console.log("Check if other participants have their cameras enabled");
  }
  
  if (emptyRemoteVideos.length === 0) {
    console.log("❌ ISSUE: No empty remote video elements found");
    console.log("This means all video elements already have streams assigned");
    console.log("The issue might be with stream quality or playback");
  }
  
  // Try to force play all videos
  console.log("🔧 Trying to force play all videos...");
  document.querySelectorAll('video').forEach((video, i) => {
    if (video.srcObject) {
      video.play().then(() => {
        console.log(`✅ Video ${i} playing`);
      }).catch(e => {
        console.log(`⚠️ Video ${i} play error:`, e.message);
      });
    }
  });
}

// Step 5: Additional diagnostics
console.log("\n🔍 DETAILED DIAGNOSTICS:");

participantDivs.forEach((div, index) => {
  const participantId = div.dataset.participantId;
  const video = div.querySelector('video');
  
  console.log(`👤 Participant ${participantId}:`, {
    hasVideoElement: !!video,
    hasStream: !!video?.srcObject,
    streamId: video?.srcObject?.id,
    videoTracks: video?.srcObject?.getVideoTracks().length || 0,
    audioTracks: video?.srcObject?.getAudioTracks().length || 0,
    readyState: video?.readyState,
    paused: video?.paused,
    muted: video?.muted
  });
});

console.log("\n🚨 INSTANT FIX COMPLETED");
console.log("If participant videos appeared, the fix worked!");
console.log("If not, check the diagnostics above for the root cause.");