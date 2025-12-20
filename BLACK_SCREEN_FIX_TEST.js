// BLACK SCREEN FIX TEST
// Run this in the browser console when you see black screens

console.log("🔍 DIAGNOSING BLACK SCREEN ISSUE...");

// Check all video elements
const videoElements = document.querySelectorAll('video');
console.log(`📹 Found ${videoElements.length} video elements`);

videoElements.forEach((video, index) => {
  console.log(`\n📺 Video ${index + 1}:`);
  console.log(`  - Has stream: ${!!video.srcObject}`);
  console.log(`  - Stream ID: ${video.srcObject?.id}`);
  console.log(`  - Video dimensions: ${video.videoWidth}x${video.videoHeight}`);
  console.log(`  - Ready state: ${video.readyState}`);
  console.log(`  - Paused: ${video.paused}`);
  console.log(`  - Muted: ${video.muted}`);
  console.log(`  - Volume: ${video.volume}`);
  console.log(`  - Current time: ${video.currentTime}`);
  
  if (video.srcObject) {
    const stream = video.srcObject;
    console.log(`  - Video tracks: ${stream.getVideoTracks().length}`);
    console.log(`  - Audio tracks: ${stream.getAudioTracks().length}`);
    
    stream.getVideoTracks().forEach((track, trackIndex) => {
      console.log(`    Video track ${trackIndex + 1}:`, {
        enabled: track.enabled,
        readyState: track.readyState,
        muted: track.muted,
        settings: track.getSettings()
      });
    });
    
    // AGGRESSIVE FIX for black screens
    if (video.videoWidth === 0 || video.videoHeight === 0 || video.paused) {
      console.log(`🔧 FIXING black screen for video ${index + 1}...`);
      
      // Method 1: Force enable all video tracks
      stream.getVideoTracks().forEach(track => {
        track.enabled = true;
      });
      
      // Method 2: Refresh stream assignment
      const originalStream = video.srcObject;
      video.srcObject = null;
      setTimeout(() => {
        video.srcObject = originalStream;
        video.muted = false;
        video.volume = 1.0;
        video.play().then(() => {
          console.log(`✅ Successfully refreshed video ${index + 1}`);
        }).catch(err => {
          console.log(`⚠️ Play failed for video ${index + 1}:`, err.message);
        });
      }, 100);
    }
  }
});

// Check remote streams in React state (if available)
if (window.remoteStreams) {
  console.log(`\n📡 Remote streams in state: ${window.remoteStreams.length}`);
  window.remoteStreams.forEach((stream, index) => {
    console.log(`Stream ${index + 1}:`, {
      peerId: stream.peerId,
      id: stream.id,
      videoTracks: stream.getVideoTracks().length,
      audioTracks: stream.getAudioTracks().length,
      videoEnabled: stream.getVideoTracks()[0]?.enabled,
      videoReadyState: stream.getVideoTracks()[0]?.readyState
    });
  });
}

console.log("\n✅ BLACK SCREEN DIAGNOSIS COMPLETE");
console.log("💡 If videos are still black, try clicking the '🔄 Fix Videos' button");