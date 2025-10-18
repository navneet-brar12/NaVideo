// server/socket/socketHandler.js
// Socket handler that tracks userName per socket and emits structured participant info.

const meetings = new Map(); // meetingId -> Map(socketId -> userName)

function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    // --- Join a meeting ---
    socket.on("join-meeting", ({ meetingId, userName }) => {
      if (!meetingId) return;

      // Create new meeting if doesn't exist
      if (!meetings.has(meetingId)) meetings.set(meetingId, new Map());
      const participants = meetings.get(meetingId);

      participants.set(socket.id, userName || "Anonymous");
      socket.join(meetingId);

      // Prepare list of other participants (excluding the new joiner)
      const otherParticipants = Array.from(participants.entries())
        .filter(([id]) => id !== socket.id)
        .map(([id, name]) => ({ socketId: id, userName: name }));

      // Send confirmation + participant list to the new user
      socket.emit("joined-room", {
        meetingId,
        socketId: socket.id,
        participants: otherParticipants,
      });

      // Notify others in the same meeting
      socket.to(meetingId).emit("user-joined", {
        socketId: socket.id,
        userName: userName || "Anonymous",
      });

      console.log(`👥 ${userName || "User"} joined meeting ${meetingId}`);
    });

    // --- WebRTC signaling relay ---
    socket.on("signal", ({ to, from, data }) => {
      if (!to) return;
      io.to(to).emit("signal", { from, data });
    });

    // --- Chat messages ---
    socket.on("send-message", ({ meetingId, sender, message }) => {
      if (!meetingId || !message) return;
      const timestamp = new Date().toISOString();

      // ✅ Broadcast to everyone else (not the sender)
      socket.to(meetingId).emit("new-message", { sender, message, timestamp });

      console.log(`💬 Message in ${meetingId} from ${sender}: ${message}`);
    });

    // --- Manual leave (when user clicks Leave) ---
    socket.on("leave-meeting", ({ meetingId }) => {
      if (!meetingId) return;
      leaveMeeting(socket, meetingId);
    });

    // --- Handle disconnect ---
    socket.on("disconnect", () => {
      for (const [meetingId, participants] of meetings.entries()) {
        if (participants.has(socket.id)) {
          const name = participants.get(socket.id);
          participants.delete(socket.id);

          socket.to(meetingId).emit("user-left", {
            socketId: socket.id,
            userName: name,
          });

          console.log(`❌ ${name} (${socket.id}) disconnected from ${meetingId}`);

          if (participants.size === 0) {
            meetings.delete(meetingId);
            console.log(`💨 Meeting ${meetingId} deleted (empty)`);
          }

          break; // a socket belongs to only one meeting
        }
      }
    });
  });
}

/**
 * Helper: Remove user from meeting manually
 */
function leaveMeeting(socket, meetingId) {
  if (!meetings.has(meetingId)) return;
  const participants = meetings.get(meetingId);
  if (!participants.has(socket.id)) return;

  const name = participants.get(socket.id);
  participants.delete(socket.id);
  socket.leave(meetingId);

  socket.to(meetingId).emit("user-left", {
    socketId: socket.id,
    userName: name,
  });

  console.log(`👋 ${name} left meeting ${meetingId}`);

  if (participants.size === 0) {
    meetings.delete(meetingId);
    console.log(`💨 Meeting ${meetingId} deleted (empty)`);
  }
}

module.exports = socketHandler;
