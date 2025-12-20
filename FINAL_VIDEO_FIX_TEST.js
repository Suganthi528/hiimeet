// 🚨 FINAL VIDEO FIX TEST - Run this in browser console
// This will test if the WebRTC fix is working

console.log("🚨 FINAL VIDEO FIX TEST STARTING...");

// Step 1: Check current video state
const localVideos = document.querySelectorAll('video[muted]');
const remoteVideos = document.querySelectorAll('video:not([muted])');
const participantDivs = document.querySelectorAll('[data-participant-id]');

console.log("📊 CURRENT STATE:");
console.log(`- Local videos: ${localVideos.length}`);
console.log(`- Remote videos: ${remoteVideos.length}`);
console.log(`- Participant divs: ${participantDivs.length}`);

// Step 2: Check each video element
console.log("\n📹 VIDEO ELEMENT ANALYSIS:");
document.querySelectorAll('video').forEach((video, index) => {
  console.log(`Video ${index}:`, {
    muted: video.muted,
    hasStream: !!video.srcObject,
    streamId: video.srcObject?.id,
    videoTracks: video.srcObject?.getVideoTracks().length || 0,
    audioTracks: video.srcObject?.getAudioTracks().length || 0,
    readyState: video.readyState,
    paused: video.paused,
    width: video.videoWidth,
    height: video.videoHeight
  });
});

// Step 3: Check participant divs
console.log("\n👥 PARTICIPANT ANALYSIS:");
participantDivs.forEach((div, index) => {
  const participantId = div.dataset.participantId;
  const video = div.querySelector('video');
  
  console.log(`Participant ${participantId}:`, {
    hasVideoElement: !!video,
    hasStream: !!video?.srcObject,
    streamActive: video?.srcObject?.active,
    videoEnabled: video?.srcObject?.getVideoTracks()[0]?.enabled,
    audioEnabled: video?.srcObject?.getAudioTracks()[0]?.enabled
  });
});

// Step 4: Find all available streams
const allStreams = [];
document.querySelectorAll('video').forEach(video => {
  if (video.srcObject && !allStreams.includes(video.srcObject)) {
    allStreams.push(video.srcObject);
  }
});

console.log(`\n📡 STREAM ANALYSIS:`);
console.log(`Total unique streams: ${allStreams.length}`);

allStreams.forEach((stream, index) => {
  console.log(`Stream ${index}:`, {
    id: stream.id,
    active: stream.active,
    videoTracks: stream.getVideoTracks().length,
    audioTracks: stream.getAudioTracks().length,
    peerId: stream.peerId || 'unknown'
  });
  
  // Check video track details
  if (stream.getVideoTracks().length > 0) {
    const videoTrack = stream.getVideoTracks()[0];
    console.log(`  Video track:`, {
      enabled: videoTrack.enabled,
      readyState: videoTrack.readyState,
      muted: videoTrack.muted,
      label: videoTrack.label
    });
  }
});

// Step 5: APPLY FIX if needed
const emptyRemoteVideos = Array.from(remoteVideos).filter(v => !v.srcObject);
console.log(`\n🔧 APPLYING FIX:`);
console.log(`Empty remote videos: ${emptyRemoteVideos.length}`);

if (allStreams.length > 1 && emptyRemoteVideos.length > 0) {
  console.log("🚀 Applying video fix...");
  
  // Skip first stream (likely local) and assign others
  const remoteStreams = allStreams.slice(1);
  
  remoteStreams.forEach((stream, index) => {
    if (emptyRemoteVideos[index]) {
      console.log(`🔧 Assigning stream ${stream.id} to empty video ${index}`);
      emptyRemoteVideos[index].srcObject = stream;
      emptyRemoteVideos[index].play().then(() => {
        console.log(`✅ SUCCESS: Video ${index} is now playing!`);
      }).catch(error => {
        console.log(`⚠️ Play error for video ${index}:`, error.message);
      });
    }
  });
  
  // Check results after 3 seconds
  setTimeout(() => {
    console.log("\n📊 FINAL RESULTS:");
    const workingRemoteVideos = Array.from(remoteVideos).filter(v => 
      v.srcObject && v.readyState >= 2 && !v.paused
    );
    
    console.log(`Working remote videos: ${workingRemoteVideos.length}/${remoteVideos.length}`);
    
    if (workingRemoteVideos.length === remoteVideos.length) {
      console.log("🎉 SUCCESS: All participant videos are now working!");
      alert("🎉 SUCCESS: All participant videos should now be visible!");
    } else if (workingRemoteVideos.length > 0) {
      console.log(`✅ PARTIAL SUCCESS: ${workingRemoteVideos.length} videos working`);
      alert(`✅ PARTIAL SUCCESS: ${workingRemoteVideos.length} participant video(s) fixed!`);
    } else {
      console.log("❌ FIX FAILED: No videos are working");
      alert("❌ Fix failed. Check console for details.");
    }
    
    // Show which videos are still not working
    remoteVideos.forEach((video, i) => {
      if (!video.srcObject || video.readyState < 2 || video.paused) {
        console.log(`❌ Video ${i} still not working:`, {
          hasStream: !!video.srcObject,
          readyState: video.readyState,
          paused: video.paused
        });
      }
    });
  }, 3000);
  
} else if (emptyRemoteVideos.length === 0) {
  console.log("✅ All remote videos already have streams assigned");
  
  // Check if they're playing
  const playingVideos = Array.from(remoteVideos).filter(v => 
    v.srcObject && v.readyState >= 2 && !v.paused
  );
  
  if (playingVideos.length === remoteVideos.length) {
    console.log("🎉 All videos are already working!");
    alert("🎉 All participant videos are already working!");
  } else {
    console.log("⚠️ Videos have streams but may not be playing properly");
    
    // Try to force play all videos
    remoteVideos.forEach((video, i) => {
      if (video.srcObject) {
        video.play().then(() => {
          console.log(`✅ Forced video ${i} to play`);
        }).catch(e => {
          console.log(`⚠️ Could not play video ${i}:`, e.message);
        });
      }
    });
  }
  
} else {
  console.log("❌ Cannot apply fix:");
  console.log(`- Available streams: ${allStreams.length}`);
  console.log(`- Empty videos: ${emptyRemoteVideos.length}`);
  
  if (allStreams.length <= 1) {
    console.log("❌ ISSUE: Not enough remote streams");
    console.log("This means other participants are not sending video");
    console.log("Make sure other participants have their cameras enabled");
    alert("❌ No remote video streams found. Make sure other participants have cameras enabled.");
  }
}

console.log("\n🚨 FINAL VIDEO FIX TEST COMPLETED");
console.log("Check the results above to see if participant videos are now visible.");