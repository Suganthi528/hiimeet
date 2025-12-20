// Add this button to your meeting interface for instant video fixing

<button 
  onClick={() => {
    console.log("🚨 MANUAL VIDEO FIX TRIGGERED");
    
    // Find all remote videos and streams
    const remoteVideos = document.querySelectorAll('video:not([muted])');
    const allStreams = [];
    
    // Collect all existing streams
    document.querySelectorAll('video').forEach(video => {
      if (video.srcObject && !allStreams.includes(video.srcObject)) {
        allStreams.push(video.srcObject);
      }
    });
    
    console.log(`Found ${allStreams.length} streams, ${remoteVideos.length} remote videos`);
    
    // Find empty remote videos
    const emptyVideos = Array.from(remoteVideos).filter(v => !v.srcObject);
    console.log(`Empty remote videos: ${emptyVideos.length}`);
    
    if (allStreams.length > 1 && emptyVideos.length > 0) {
      // Skip first stream (local) and assign others
      const remoteStreams = allStreams.slice(1);
      
      remoteStreams.forEach((stream, i) => {
        if (emptyVideos[i]) {
          console.log(`🔧 Manually assigning stream ${i} to empty video`);
          emptyVideos[i].srcObject = stream;
          emptyVideos[i].play().then(() => {
            console.log(`✅ SUCCESS: Video ${i} now playing!`);
          }).catch(e => {
            console.log(`⚠️ Play error for video ${i}:`, e.message);
          });
        }
      });
      
      setTimeout(() => {
        const workingVideos = Array.from(remoteVideos).filter(v => v.srcObject && v.readyState >= 2);
        if (workingVideos.length > 0) {
          alert(`✅ SUCCESS: Fixed ${workingVideos.length} participant video(s)!`);
        } else {
          alert("⚠️ Could not fix videos. Check console for details.");
        }
      }, 2000);
      
    } else {
      alert("❌ No remote streams found or no empty videos to fix.");
      console.log("Diagnosis: Either participants don't have cameras enabled, or all videos already have streams assigned.");
    }
  }}
  style={{
    background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "25px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "bold",
    margin: "10px"
  }}
  title="Manually fix participant videos"
>
  🔧 FIX ALL VIDEOS
</button>