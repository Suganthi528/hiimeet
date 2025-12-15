# Screen Sharing Feature

## Overview
The screen sharing feature allows participants in video meetings to share their screen, application windows, or browser tabs with other participants in real-time.

## Features

### 🖥️ Screen Sharing Capabilities
- **Full Screen Sharing**: Share entire desktop/monitor
- **Application Window Sharing**: Share specific application windows
- **Browser Tab Sharing**: Share specific browser tabs
- **Audio Sharing**: Include system audio when sharing (if supported by browser)
- **Real-time Synchronization**: All participants see the shared screen instantly

### 🎛️ User Controls
- **Toggle Button**: Easy one-click start/stop screen sharing
- **Visual Indicators**: Clear indication when screen sharing is active
- **Automatic Cleanup**: Screen sharing stops automatically when user leaves meeting
- **Browser Controls**: Users can stop sharing via browser's native controls

### 📱 User Experience
- **Permission Handling**: Clear error messages for permission issues
- **Visual Feedback**: Screen sharing indicator on video tile
- **Notifications**: Real-time notifications when someone starts/stops sharing
- **Seamless Switching**: Smooth transition between camera and screen sharing

## Technical Implementation

### Frontend (React)
- **State Management**: `isSharing` and `screenStream` state variables
- **Media API**: Uses `getDisplayMedia()` for screen capture
- **WebRTC Integration**: Replaces video tracks in peer connections
- **Error Handling**: Comprehensive error handling for various scenarios

### Backend (Node.js/Socket.io)
- **Real-time Events**: Socket handlers for screen sharing notifications
- **Room Management**: Tracks screen sharing status per room
- **Broadcast System**: Notifies all participants about screen sharing events

### Browser Support
- **Chrome/Edge**: Full support including audio sharing
- **Firefox**: Full support with audio sharing
- **Safari**: Basic screen sharing (limited audio support)
- **Mobile**: Limited support (iOS Safari, Android Chrome)

## Usage Instructions

### For Participants
1. **Start Screen Sharing**:
   - Click the "🖥 Share Screen" button in meeting controls
   - Select what to share (screen, window, or tab)
   - Click "Share" to confirm
   - Screen sharing indicator appears on your video

2. **Stop Screen Sharing**:
   - Click "🛑 Stop Share" button, OR
   - Use browser's "Stop Sharing" button
   - Automatically returns to camera view

### Visual Indicators
- **Red Border**: Video tile has red border when screen sharing
- **Screen Icon**: 📺 icon appears next to participant name
- **Pulsing Button**: Screen share button pulses when active
- **System Messages**: Chat shows when someone starts/stops sharing

## Error Handling

### Common Issues & Solutions
1. **Permission Denied**: User needs to allow screen sharing in browser
2. **No Screen Available**: Screen sharing not supported on device
3. **Sharing Cancelled**: User cancelled the screen sharing dialog
4. **Camera Restart Failed**: Falls back to placeholder if camera can't restart

### Error Messages
- Clear, user-friendly error dialogs
- Step-by-step instructions for fixing issues
- Browser-specific guidance for permissions

## Security & Privacy

### Privacy Protection
- **User Control**: Users must explicitly grant permission
- **Visual Indicators**: Clear indication when screen is being shared
- **Easy Stop**: Multiple ways to stop sharing immediately
- **No Recording**: Screen sharing is live-only, not recorded by default

### Browser Security
- **Secure Context**: Requires HTTPS in production
- **Permission API**: Uses browser's native permission system
- **User Consent**: Browser shows clear consent dialogs

## Performance Considerations

### Optimization
- **Quality Adaptation**: Automatically adjusts quality based on connection
- **Efficient Encoding**: Uses browser's optimized video encoding
- **Bandwidth Management**: Screen sharing uses appropriate bitrates
- **CPU Usage**: Leverages hardware acceleration when available

### Best Practices
- **Close Unnecessary Apps**: Reduces CPU usage during sharing
- **Stable Internet**: Ensure good connection for smooth sharing
- **Screen Resolution**: Lower resolutions share more smoothly
- **Audio Feedback**: Use headphones to prevent audio feedback

## Future Enhancements

### Planned Features
- **Annotation Tools**: Draw on shared screen
- **Pointer Highlighting**: Show cursor movements
- **Recording Integration**: Record screen sharing sessions
- **Quality Controls**: Manual quality adjustment
- **Multi-Screen Support**: Share multiple monitors

### Advanced Features
- **Remote Control**: Allow others to control shared screen
- **Whiteboard Integration**: Combine with whiteboard features
- **File Sharing**: Share files during screen sharing
- **Presentation Mode**: Optimized for presentations

## Troubleshooting

### Common Problems
1. **Black Screen**: Check browser permissions and try refreshing
2. **No Audio**: Ensure "Share audio" is checked when sharing
3. **Laggy Sharing**: Check internet connection and close other apps
4. **Can't Stop**: Use browser's stop sharing button as backup

### Browser-Specific Issues
- **Chrome**: Usually works best, supports all features
- **Firefox**: Good support, may need permission reset
- **Safari**: Limited features, audio sharing may not work
- **Mobile**: Very limited, recommend using desktop

## API Reference

### Frontend Functions
```javascript
toggleScreenShare()    // Start/stop screen sharing
stopScreenShare()      // Force stop screen sharing
```

### Socket Events
```javascript
// Outgoing
socket.emit('screen-share-started', roomId, userName)
socket.emit('screen-share-stopped', roomId, userName)

// Incoming  
socket.on('screen-share-notification', handleNotification)
```

### CSS Classes
```css
.screen-sharing-indicator  // Red indicator overlay
.video-wrapper.screen-sharing  // Red border for sharing video
.screen-sharing-active  // Active button styling
```

## Conclusion
The screen sharing feature provides a robust, user-friendly way for meeting participants to share their screens with comprehensive error handling, visual feedback, and cross-browser compatibility.