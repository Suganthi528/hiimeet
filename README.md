# Video Meeting Application

A full-featured video meeting application with room management, authentication, recording, and analytics.

## Features

### Create Room
- Admin can create rooms with:
  - Creator name and email
  - Room ID and password
  - Scheduled date and time
- Created rooms appear in Upcoming Events

### Join Room
- Users can join with:
  - Name and email
  - Room ID and password
- Password authentication required

### Meeting Features
- **WebRTC Video/Audio**: Real-time video and audio communication
- **Automatic Recording**: Starts when first person joins
- **Live Participant List**: Shows all active participants
- **Speaking Time Tracking**: Tracks how long each person speaks
- **Chat**: Real-time text messaging
- **Screen Sharing**: Share your screen with participants
- **Speaking Indicator**: Visual indicator when someone is talking

### Admin Controls
- Admin can join anytime
- When admin leaves, meeting ends for everyone
- Recordings are automatically saved

### Post-Meeting
- **Recordings Gallery**: View all recorded meetings with:
  - Duration
  - Participant list
  - Speaking time for each participant
  - Download option
- **Meeting History**: Complete log of:
  - Who joined and when
  - Who left and when
  - All meeting events

## Installation

### Backend Setup
```bash
cd backend
npm install
node Server.js
```

### Frontend Setup
```bash
cd video-meet
npm install
npm start
```

## Usage

1. **Start Backend**: Run `node Server.js` in the backend folder (port 5000)
2. **Start Frontend**: Run `npm start` in the video-meet folder (port 3000)
3. **Create a Room**: Click "Create Room" and fill in the details
4. **Join a Room**: Click "Join Room" and enter credentials
5. **View Upcoming Events**: See all scheduled meetings
6. **Check History**: View past meeting logs
7. **Access Recordings**: Download and view recorded meetings

## Technology Stack

- **Frontend**: React, Socket.IO Client, WebRTC
- **Backend**: Node.js, Express, Socket.IO
- **Real-time Communication**: WebRTC for peer-to-peer video/audio
- **Signaling**: Socket.IO for WebRTC signaling and chat

## Notes

- This is a demo application using in-memory storage
- For production, implement:
  - Database (MongoDB, PostgreSQL, etc.)
  - Actual video recording (using MediaRecorder API or server-side recording)
  - TURN server for better connectivity
  - Authentication and authorization
  - File storage for recordings (AWS S3, etc.)
