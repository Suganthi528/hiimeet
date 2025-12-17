require('dotenv').config();
const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Server } = require('socket.io');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/network-info', (req, res) => {
  try {
    const nets = os.networkInterfaces();
    const interfaces = {};
    Object.keys(nets).forEach((name) => {
      interfaces[name] = nets[name]
        .filter((n) => n.family === 'IPv4')
        .map((n) => ({ address: n.address, internal: n.internal }));
    });
    res.json({
      boundHost: process.env.HOST || '0.0.0.0',
      port: process.env.PORT || 5000,
      interfaces,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

try {
  const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
  if (fs.existsSync(frontendBuildPath)) {
    console.log('📦 Serving frontend static files from', frontendBuildPath);
    app.use(express.static(frontendBuildPath));
    app.get('*', (req, res) => res.sendFile(path.join(frontendBuildPath, 'index.html')));
  }
} catch (e) {
  console.warn('⚠️ Error while checking/serving frontend build:', e.message);
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'], credentials: true },
  transports: ['websocket', 'polling'],
});

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const MAX_PORT_RETRIES = 12;

function logListening(port) {
  const addresses = [];
  const nets = os.networkInterfaces();
  Object.keys(nets).forEach((name) => {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) addresses.push(net.address);
    }
  });
  console.log(`🚀 Server running on http://${HOST}:${port}`);
  if (HOST === '0.0.0.0' && addresses.length > 0) {
    console.log('✅ Backend reachable on your LAN at:');
    addresses.forEach((addr) => console.log(`   http://${addr}:${port}`));
  }
}

function startServer(port = DEFAULT_PORT, retriesLeft = MAX_PORT_RETRIES) {
  server.removeAllListeners('error');
  server.removeAllListeners('listening');
  server.once('listening', () => logListening(port));
  server.once('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      if (retriesLeft > 0) {
        console.warn(`⚠️ Port ${port} in use, trying ${port + 1}`);
        return setTimeout(() => startServer(port + 1, retriesLeft - 1), 300);
      }
      console.error('No available ports found after retries.');
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });
  server.listen(port, HOST);
}

const rooms = {};
const socketData = {};
const events = [];
const emailPasscodes = {};

function generatePasscode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createEmailTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return null;
}

async function sendPasscodeEmail(userEmail, passcode, roomId) {
  try {
    let transporter = createEmailTransporter();
    if (!transporter) {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    }
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@meetingapp.com',
      to: userEmail,
      subject: 'Your Meeting Room Passcode',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Meeting Room Access Passcode</h2>
        <p>Your passcode is:</p>
        <div style="background:#f0f0f0;padding:20px;text-align:center;border-radius:8px">
          <h1 style="letter-spacing:6px">${passcode}</h1>
        </div>
        <p>Room ID: ${roomId}</p>
        <p>This passcode expires in 10 minutes.</p>
      </div>`,
      text: `Your meeting room passcode is: ${passcode}\nRoom ID: ${roomId}\nThis passcode expires in 10 minutes.`,
    };
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== 'production' && !process.env.EMAIL_USER) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log(`📧 Test email preview: ${previewUrl} (passcode: ${passcode})`);
    } else {
      console.log(`📧 Passcode email sent to ${userEmail}`);
    }
    return true;
  } catch (err) {
    console.error('Error sending email:', err);
    return process.env.NODE_ENV !== 'production';
  }
}

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('create-event', (eventData) => {
    const event = {
      id: eventData.roomId,
      ...eventData,
      adminId: socket.id,
      createdAt: new Date().toISOString(),
    };
    events.push(event);
    events.sort((a, b) => new Date(a.date + ' ' + (a.time || '')) - new Date(b.date + ' ' + (b.time || '')));
    io.emit('events-updated', events);
  });

  socket.on('delete-event', ({ eventId, adminName, adminEmail }) => {
    console.log(`🗑️ Delete event request: ${eventId} by ${adminName} (${adminEmail})`);
    
    // Find the event to delete
    const eventIndex = events.findIndex(event => 
      event.roomId === eventId && 
      event.adminName === adminName && 
      event.adminEmail === adminEmail
    );
    
    if (eventIndex === -1) {
      console.log(`❌ Event not found or unauthorized delete attempt: ${eventId}`);
      socket.emit('delete-event-error', { 
        message: 'Event not found or you are not authorized to delete this event.' 
      });
      return;
    }
    
    // Remove the event from the array
    const deletedEvent = events.splice(eventIndex, 1)[0];
    console.log(`✅ Event deleted successfully: ${deletedEvent.title} (${eventId})`);
    
    // Broadcast updated events list to all clients
    io.emit('events-updated', events);
    
    // Send confirmation to the admin who deleted the event
    socket.emit('delete-event-success', { 
      eventId, 
      eventTitle: deletedEvent.title,
      message: `Event "${deletedEvent.title}" has been deleted successfully.` 
    });
  });

  socket.on('get-events', () => socket.emit('events-updated', events));

  socket.on('request-email-passcode', async (roomId, userEmail, roomPasscode) => {
    const room = rooms[roomId];
    if (!room) return socket.emit('passcode-error', { message: 'Room does not exist!' });
    if (room.roomPasscode && room.roomPasscode !== roomPasscode) {
      return socket.emit('passcode-error', { message: 'Invalid room passcode.' });
    }
    const emailLower = (userEmail || '').toLowerCase();
    if (room.joinedEmails.has(emailLower)) {
      return socket.emit('passcode-error', { message: 'This email is already in use.' });
    }
    const passcode = generatePasscode();
    emailPasscodes[emailLower] = {
      passcode,
      roomId,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };
    const sent = await sendPasscodeEmail(emailLower, passcode, roomId);
    if (sent) {
      socket.emit('passcode-sent', { email: emailLower, passcode });
    } else {
      socket.emit('passcode-error', { message: 'Failed to send email.' });
    }
  });

  socket.on('verify-passcode', (roomId, userEmail, passcode) => {
    const emailLower = (userEmail || '').toLowerCase();
    const stored = emailPasscodes[emailLower];
    if (!stored || stored.roomId !== roomId) {
      return socket.emit('passcode-verified', { verified: false });
    }
    if (Date.now() > stored.expiresAt) {
      delete emailPasscodes[emailLower];
      return socket.emit('passcode-verified', { verified: false, message: 'Passcode expired.' });
    }
    if (stored.passcode !== passcode) {
      return socket.emit('passcode-verified', { verified: false, message: 'Invalid passcode.' });
    }
    delete emailPasscodes[emailLower];
    socket.emit('passcode-verified', { verified: true, roomId });
  });

  socket.on('create-room', (roomId, userName, userEmail, isAdmin, roomPasscode) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = {
        users: [],
        adminId: socket.id,
        meetingTime: null,
        meetingEndTime: null,
        joinedEmails: new Set(),
        stats: { speechUsers: new Set(), chatUsers: new Set() },
        roomPasscode: roomPasscode || null,
      };
    }
    rooms[roomId].users.push({
      id: socket.id,
      name: userName,
      email: (userEmail || '').toLowerCase(),
      isAdmin: !!isAdmin,
    });
    rooms[roomId].joinedEmails.add((userEmail || '').toLowerCase());
    rooms[roomId].adminId = socket.id;
    socketData[socket.id] = { roomId, userName, userEmail: (userEmail || '').toLowerCase(), isAdmin: !!isAdmin };
    socket.emit('admin-status', !!isAdmin);
    io.to(roomId).emit('participant-list', rooms[roomId].users);
    const otherUsers = rooms[roomId].users.filter((u) => u.id !== socket.id).map((u) => u.id);
    socket.emit('all-users', otherUsers);
    socket.to(roomId).emit('user-joined', socket.id);
    console.log(`👑 Admin ${userName} created room ${roomId}`);
  });

  socket.on('join-room', (roomId, userName, userEmail, roomPasscode) => {
    const room = rooms[roomId];
    if (!room) {
      return socket.emit('email-check', { valid: false, message: 'Room does not exist!' });
    }
    if (room.roomPasscode && room.roomPasscode !== roomPasscode) {
      return socket.emit('email-check', { valid: false, message: 'Invalid room passcode!' });
    }
    const emailLower = (userEmail || '').toLowerCase();
    if (room.joinedEmails.has(emailLower)) {
      return socket.emit('email-check', { valid: false, message: 'This email is already in use.' });
    }
    socket.join(roomId);
    room.users.push({ id: socket.id, name: userName, email: emailLower, isAdmin: false });
    room.joinedEmails.add(emailLower);
    socketData[socket.id] = { roomId, userName, userEmail: emailLower, isAdmin: false };
    socket.emit('email-check', { valid: true, message: 'Joined successfully!' });
    socket.emit('admin-status', false);
    io.to(roomId).emit('participant-list', room.users);
    const otherUsers = room.users.filter((u) => u.id !== socket.id).map((u) => u.id);
    socket.emit('all-users', otherUsers);
    socket.to(roomId).emit('user-joined', socket.id);
    const joinMessage = {
      id: `join-${Date.now()}`,
      user: 'System',
      text: `${userName} joined the meeting`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system',
    };
    io.to(roomId).emit('new-message', joinMessage);
    if (room.meetingTime) socket.emit('meeting-time-updated', room.meetingTime);
    if (room.meetingEndTime) socket.emit('meeting-end-time-updated', room.meetingEndTime);
    console.log(`✅ ${userName} joined room ${roomId}`);
  });

  socket.on('set-meeting-time', (roomId, meetingTime) => {
    const room = rooms[roomId];
    if (!room || room.adminId !== socket.id) return;
    room.meetingTime = meetingTime;
    io.to(roomId).emit('meeting-time-updated', meetingTime);
  });

  socket.on('set-meeting-end-time', (roomId, meetingEndTime) => {
    const room = rooms[roomId];
    if (!room || room.adminId !== socket.id) return;
    room.meetingEndTime = meetingEndTime;
    io.to(roomId).emit('meeting-end-time-updated', meetingEndTime);
  });

  socket.on('send-message', (roomId, message) => {
    const room = rooms[roomId];
    if (!room) return;
    room.stats.chatUsers.add(socket.id);
    io.to(roomId).emit('new-message', message);
  });

  socket.on('user-speaking', (roomId, isSpeaking) => {
    const room = rooms[roomId];
    if (!room) return;
    if (isSpeaking) room.stats.speechUsers.add(socket.id);
  });

  socket.on('get-meeting-stats', (roomId) => {
    const room = rooms[roomId];
    if (!room || room.adminId !== socket.id) return;
    const stats = {
      totalParticipants: room.users.length,
      speechParticipants: room.stats.speechUsers.size,
      chatParticipants: room.stats.chatUsers.size,
      speechUsers: Array.from(room.stats.speechUsers).map((id) => {
        const u = room.users.find((x) => x.id === id);
        return u ? u.name : id;
      }),
      chatUsers: Array.from(room.stats.chatUsers).map((id) => {
        const u = room.users.find((x) => x.id === id);
        return u ? u.name : id;
      }),
    };
    socket.emit('meeting-stats', stats);
  });

  socket.on('get-participants', (roomId) => {
    const room = rooms[roomId];
    if (room) socket.emit('participant-list', room.users);
  });

  socket.on('signal', ({ to, from, signal }) => {
    io.to(to).emit('signal', { from, signal });
  });

  // Media ready handler - ensures all participants know when someone's media is ready
  socket.on('media-ready', (roomId) => {
    const room = rooms[roomId];
    if (!room) return;
    
    const user = room.users.find((u) => u.id === socket.id);
    if (!user) return;
    
    console.log(`📹 ${user.name} media stream is ready`);
    
    // Notify all other participants that this user's media is ready
    socket.to(roomId).emit('participant-media-ready', {
      userId: socket.id,
      userName: user.name
    });
    
    // Send system message about media readiness
    const mediaMessage = {
      id: `media-ready-${Date.now()}`,
      user: 'System',
      text: `📹 ${user.name} is ready for video calls`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system',
    };
    io.to(roomId).emit('new-message', mediaMessage);
  });

  // Whiteboard handlers
  socket.on('whiteboard-draw', (roomId, drawData) => {
    const room = rooms[roomId];
    if (!room) return;
    
    // Store drawing data
    if (!room.whiteboardData) room.whiteboardData = [];
    room.whiteboardData.push(drawData);
    
    // Broadcast to all other participants
    socket.to(roomId).emit('whiteboard-draw', drawData);
  });

  socket.on('whiteboard-clear', (roomId) => {
    const room = rooms[roomId];
    if (!room) return;
    
    // Clear stored data
    room.whiteboardData = [];
    
    // Broadcast clear to all participants
    io.to(roomId).emit('whiteboard-clear');
  });

  socket.on('get-whiteboard', (roomId) => {
    const room = rooms[roomId];
    if (!room || !room.whiteboardData) return;
    
    // Send existing whiteboard data to new participant
    socket.emit('whiteboard-data', room.whiteboardData);
  });

  // Reactions handler
  socket.on('send-reaction', (roomId, emoji) => {
    const room = rooms[roomId];
    if (!room) return;
    
    const user = room.users.find((u) => u.id === socket.id);
    if (!user) return;
    
    const reactionData = {
      reaction: emoji,
      userName: user.name,
      userId: socket.id,
      timestamp: Date.now(),
    };
    
    // Broadcast reaction to all participants including sender
    io.to(roomId).emit('user-reaction', reactionData);
  });

  // Raise hand handler
  socket.on('raise-hand', (roomId, isRaised) => {
    const room = rooms[roomId];
    if (!room) return;
    
    const user = room.users.find((u) => u.id === socket.id);
    if (!user) return;
    
    // Update user's hand raised status
    user.handRaised = isRaised;
    
    // Broadcast to all participants
    io.to(roomId).emit('hand-raised-updated', {
      userId: socket.id,
      userName: user.name,
      isRaised: isRaised,
    });
  });

  // Camera status change handler
  socket.on('camera-status-changed', ({ roomId, userId, userName, cameraOn }) => {
    const room = rooms[roomId];
    if (!room) return;

    console.log(`📹 ${userName} (${userId}) camera status changed: ${cameraOn ? 'ON' : 'OFF'}`);

    // Update participant camera status in room data
    const participant = room.users.find(u => u.id === userId);
    if (participant) {
      participant.cameraOn = cameraOn;
    }

    // Broadcast camera status change to all other participants
    socket.to(roomId).emit('camera-status-changed', {
      userId,
      userName,
      cameraOn
    });

    console.log(`✅ Camera status broadcasted for ${userName}`);
  });

  // Admin function to end meeting immediately (including scheduled end)
  socket.on('admin-end-meeting', ({ roomId, adminName, reason }) => {
    const room = rooms[roomId];
    if (!room) {
      console.log(`❌ Room ${roomId} not found for meeting end`);
      return;
    }

    // Verify that the requesting user is the admin (or allow system automatic end)
    const admin = room.users.find(u => u.id === socket.id);
    if (!admin || !admin.isAdmin) {
      console.log(`❌ Unauthorized meeting end attempt by ${socket.id}`);
      socket.emit('admin-action-error', { message: 'Only admins can end meetings' });
      return;
    }

    console.log(`👑 Admin ${adminName} ending meeting ${roomId} - ${reason}`);

    // Generate final meeting statistics
    const stats = {
      totalParticipants: room.users.length,
      speechParticipants: room.stats.speechUsers.size,
      chatParticipants: room.stats.chatUsers.size,
      speechUsers: Array.from(room.stats.speechUsers).map((id) => {
        const u = room.users.find((x) => x.id === id);
        return u ? u.name : id;
      }),
      chatUsers: Array.from(room.stats.chatUsers).map((id) => {
        const u = room.users.find((x) => x.id === id);
        return u ? u.name : id;
      }),
      endReason: reason,
      endTime: new Date().toISOString()
    };

    // Send final system message about meeting end
    const endMessage = {
      id: `meeting-end-${Date.now()}`,
      user: 'System',
      text: `🔚 Meeting ended by admin ${adminName}. Reason: ${reason}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system',
    };
    io.to(roomId).emit('new-message', endMessage);

    // Notify all participants that meeting has ended
    room.users.forEach((u) => {
      io.to(u.id).emit('meeting-ended-by-admin', {
        stats,
        adminName,
        reason,
        roomId,
        message: reason.includes('Scheduled end time') ? 
          `The meeting has reached its scheduled end time and has been automatically terminated.` :
          `The meeting has been ended by admin ${adminName}. Reason: ${reason}`
      });
    });

    // Clean up room and socket data
    delete rooms[roomId];
    room.users.forEach((u) => delete socketData[u.id]);

    console.log(`✅ Meeting ${roomId} successfully ended by admin ${adminName} - ${reason}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    const room = rooms[roomId];
    if (!room) return;
    const user = room.users.find((u) => u.id === socket.id);
    if (!user) return;
    if (user.isAdmin) {
      const stats = {
        totalParticipants: room.users.length,
        speechParticipants: room.stats.speechUsers.size,
        chatParticipants: room.stats.chatUsers.size,
        speechUsers: Array.from(room.stats.speechUsers).map((id) => {
          const u = room.users.find((x) => x.id === id);
          return u ? u.name : id;
        }),
        chatUsers: Array.from(room.stats.chatUsers).map((id) => {
          const u = room.users.find((x) => x.id === id);
          return u ? u.name : id;
        }),
      };
      room.users.forEach((u) => {
        if (u.id !== socket.id) io.to(u.id).emit('admin-left-meeting', { stats, roomId });
      });
      delete rooms[roomId];
      room.users.forEach((u) => delete socketData[u.id]);
      return;
    }
    room.joinedEmails.delete(user.email.toLowerCase());
    room.users = room.users.filter((u) => u.id !== socket.id);
    const leaveMessage = {
      id: `leave-${Date.now()}`,
      user: 'System',
      text: `${user.name} left the meeting`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system',
    };
    io.to(roomId).emit('new-message', leaveMessage);
    socket.to(roomId).emit('user-left', socket.id);
    io.to(roomId).emit('participant-list', room.users);
    if (room.users.length === 0) delete rooms[roomId];
    delete socketData[socket.id];
  });

  socket.on('disconnect', () => {
    const data = socketData[socket.id];
    if (data && data.roomId) {
      const room = rooms[data.roomId];
      if (room) {
        const user = room.users.find((u) => u.id === socket.id);
        if (user) {
          if (user.isAdmin) {
            const stats = {
              totalParticipants: room.users.length,
              speechParticipants: room.stats.speechUsers.size,
              chatParticipants: room.stats.chatUsers.size,
              speechUsers: Array.from(room.stats.speechUsers).map((id) => {
                const u = room.users.find((x) => x.id === id);
                return u ? u.name : id;
              }),
              chatUsers: Array.from(room.stats.chatUsers).map((id) => {
                const u = room.users.find((x) => x.id === id);
                return u ? u.name : id;
              }),
            };
            room.users.forEach((u) => {
              if (u.id !== socket.id) io.to(u.id).emit('admin-left-meeting', { stats, roomId: data.roomId });
            });
            delete rooms[data.roomId];
            room.users.forEach((u) => delete socketData[u.id]);
            delete socketData[socket.id];
            return;
          }
          room.joinedEmails.delete(user.email.toLowerCase());
          room.users = room.users.filter((u) => u.id !== socket.id);
          const leaveMessage = {
            id: `leave-${Date.now()}`,
            user: 'System',
            text: `${user.name} left the meeting`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'system',
          };
          io.to(data.roomId).emit('new-message', leaveMessage);
          socket.to(data.roomId).emit('user-left', socket.id);
          io.to(data.roomId).emit('participant-list', room.users);
          if (room.users.length === 0) delete rooms[data.roomId];
        }
      }
    }
    delete socketData[socket.id];
  });
});

try {
  startServer();
} catch (err) {
  console.error('Failed to start server:', err);
  process.exit(1);
}

module.exports = { app, server, io };
