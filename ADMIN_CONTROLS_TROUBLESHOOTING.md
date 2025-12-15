# Admin Controls Troubleshooting Guide

## 🔍 How to See Admin Participant Removal Controls

### Step 1: Verify Admin Status
1. **Create a meeting** (don't just join one)
2. Look for these indicators in the meeting:
   - `👑 Admin` badge in the meeting header
   - `Admin Status: ✅ YES` in the debug info
   - `🧪 Test Admin` button in controls
   - `👑 Admin Controls` button in controls

### Step 2: Open People Panel
1. Click the `👥 Show People` button in the meeting controls
2. The people panel will slide in from the right side
3. Look for the debug info showing:
   ```
   Debug Info:
   Admin: ✅ YES
   Participants: [number]
   Remove buttons: ✅ Should show
   ```

### Step 3: See Remove Buttons
- Each participant will have a bright red `🚫 Remove` button
- The buttons are large, white-bordered, and very visible
- Only admins can see these buttons

## 🎯 Quick Test Steps

### Test 1: Verify You're Admin
```
1. Create a new meeting (Room ID: test-123, Passcode: 1234)
2. Join as the creator
3. Look for "👑 Admin" badge in header
4. Click "🧪 Test Admin" button - should show admin confirmation
```

### Test 2: Test with Multiple Participants
```
1. Open meeting in multiple browser tabs/windows
2. Join as different participants in each tab
3. In the admin tab, click "👥 Show People"
4. You should see red "🚫 Remove" buttons next to each participant
```

### Test 3: Test Removal Process
```
1. In admin tab, click "🚫 Remove" next to a participant
2. Confirm the removal in the dialog
3. The participant should be immediately disconnected
4. System message should appear in chat
```

## 🔧 If Controls Still Don't Show

### Check 1: Admin Status
- Make sure you **created** the meeting, not just joined it
- The person who creates the meeting becomes the admin
- Only one admin per meeting (the creator)

### Check 2: Browser Console
- Press F12 to open developer tools
- Check for any JavaScript errors
- Look for admin status logs

### Check 3: Meeting State
- Make sure you're in an active meeting (not home page)
- Ensure other participants have joined
- Verify the people panel opens when clicking "👥 Show People"

## 🎨 Visual Indicators You Should See

### Meeting Header:
```
Meeting ID: test-123 👑 Admin
Admin Status: ✅ YES | Participants: 2
```

### Controls Section:
```
[🔇 Mute] [📷 Camera Off] [🖥 Share Screen] [💬 Show Chat] [👥 Show People] [🎨 Whiteboard] [😊 Reactions] [✋ Raise Hand] [📊 View Stats] [🧪 Test Admin] [👑 Admin Controls] [🚪 Leave]
```

### People Panel (when opened):
```
👥 People                                    ✕

Debug Info:
Admin: ✅ YES
Participants: 2
Remove buttons: ✅ Should show

In call (3) 👑 Admin Controls Active

👤 You (Admin)                    🔊 ✋
👤 John Doe                       🚫 Remove
👤 Jane Smith            🔊       🚫 Remove
```

## 🚨 Common Issues & Solutions

### Issue 1: "I don't see the Admin badge"
**Solution**: You joined as a participant, not as admin. Create a new meeting instead.

### Issue 2: "People panel doesn't open"
**Solution**: Check if CSS is loaded properly. The panel slides in from the right.

### Issue 3: "No remove buttons visible"
**Solution**: Verify admin status and ensure other participants have joined.

### Issue 4: "Remove button doesn't work"
**Solution**: Check browser console for errors. Ensure backend is running.

## 📱 Mobile Testing
- On mobile, the people panel takes full screen width
- Remove buttons are touch-friendly and larger
- All functionality works the same as desktop

## 🔄 Reset Steps
If nothing works:
1. Refresh the browser
2. Create a completely new meeting
3. Join as the creator (admin)
4. Have someone else join as participant
5. Try the people panel again

## ✅ Success Indicators
You know it's working when you see:
- ✅ `👑 Admin` badge in header
- ✅ `🧪 Test Admin` button works
- ✅ People panel opens with debug info
- ✅ Red `🚫 Remove` buttons next to participants
- ✅ Removal confirmation dialog appears
- ✅ Participants get disconnected when removed

The admin participant removal feature is fully implemented and should be visible if you follow these steps correctly!