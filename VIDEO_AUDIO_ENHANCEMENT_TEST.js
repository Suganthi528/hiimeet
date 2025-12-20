// VIDEO & AUDIO ENHANCEMENT TEST
// Run this in the browser console when in a meeting

console.log("🧪 TESTING VIDEO & AUDIO ENHANCEMENTS...");

// Test 1: Check all video elements
const videoElements = document.querySelectorAll('video');
console.log(`📹 Found ${videoElements.length} video elements`);

videoElements.forEach((video, index) => {
  console.log(`Video ${index + 1}:`, {
    hasSrcObject: !!video.srcObject,
    muted: video.muted,
    volume: video.volume,
    paused: video.paused,
    readyState: video.readyState,
    videoWidth: video.videoWidth,
    videoHeight: video.videoHeight
  });
  
  // Force unmute remote videos
  if (video.srcObject && !video.muted && video.volume === 0) {
    video.volume = 1.0;
    console.log(`🔊 Fixed volume for video ${index + 1}`);
  }
});

// Test 2: Check MediaStream audio tracks
const streams = [];
videoElements.forEach(video => {
  if (video.srcObject) {
    streams.push(video.srcObject);
  }
});

console.log(`🎵 Found ${streams.length} media streams`);
streams.forEach((stream, index) => {
  const audioTracks = stream.getAudioTracks();
  console.log(`Stream ${index + 1} audio tracks:`, audioTracks.length);
  
  audioTracks.forEach((track, trackIndex) => {
    console.log(`  Track ${trackIndex + 1}:`, {
      enabled: track.enabled,
      readyState: track.readyState,
      muted: track.muted
    });
    
    // Ensure audio tracks are enabled
    if (!track.enabled) {
      track.enabled = true;
      console.log(`✅ Enabled audio track ${trackIndex + 1} in stream ${index + 1}`);
    }
  });
});

// Test 3: Force play all videos
console.log("▶️ Forcing play on all videos...");
videoElements.forEach((video, index) => {
  if (video.paused) {
    video.play().then(() => {
      console.log(`✅ Started playing video ${index + 1}`);
    }).catch(err => {
      console.log(`⚠️ Autoplay blocked for video ${index + 1}:`, err.message);
    });
  }
});

console.log("✅ VIDEO & AUDIO ENHANCEMENT TEST COMPLETE");
console.log("📋 Check the logs above for any issues");