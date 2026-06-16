import { Server } from "socket.io";
import { createServer } from "http";

interface OnlineUser {
  userId: number;
  socketId: string;
}

const onlineUsers: OnlineUser[] = [];

export function setupSocket(app: any) {
  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    const userId = Number(socket.handshake.query.userId);
    if (userId) {
      // Xóa socket cũ của user nếu có
      const idx = onlineUsers.findIndex((u) => u.userId === userId);
      if (idx !== -1) onlineUsers.splice(idx, 1);
      onlineUsers.push({ userId, socketId: socket.id });
      console.log(`🟢 User ${userId} online (socket: ${socket.id})`);
    }

    socket.on("join_room", (id: number) => {
      socket.join(`conv_${id}`);
      console.log(`User ${userId} joined conv_${id}`);
    });

    socket.on("send_message", (d: any) => {
      io.to(`conv_${d.conversationId}`).emit("new_message", {
        ...d,
        createdAt: new Date().toISOString(),
      });
    });

    // --- WebRTC Signaling ---

    // Gọi video: caller gửi offer đến callee
    socket.on(
      "call_user",
      (data: {
        to: number;
        conversationId: number;
        signal: any;
        callerName: string;
      }) => {
        const callee = onlineUsers.find((u) => u.userId === data.to);
        if (callee) {
          io.to(callee.socketId).emit("incoming_call", {
            from: userId,
            callerName: data.callerName,
            signal: data.signal,
            conversationId: data.conversationId,
          });
        }
      },
    );

    // Nhận cuộc gọi: callee gửi answer về caller
    socket.on("answer_call", (data: { to: number; signal: any }) => {
      const caller = onlineUsers.find((u) => u.userId === data.to);
      if (caller) {
        io.to(caller.socketId).emit("call_accepted", { signal: data.signal });
      }
    });

    // Từ chối cuộc gọi
    socket.on("reject_call", (data: { to: number }) => {
      const caller = onlineUsers.find((u) => u.userId === data.to);
      if (caller) {
        io.to(caller.socketId).emit("call_rejected");
      }
    });

    // Kết thúc cuộc gọi
    socket.on("end_call", (data: { to: number }) => {
      const peer = onlineUsers.find((u) => u.userId === data.to);
      if (peer) {
        io.to(peer.socketId).emit("call_ended");
      }
    });

    // Trao đổi ICE candidates
    socket.on("ice_candidate", (data: { to: number; candidate: any }) => {
      const peer = onlineUsers.find((u) => u.userId === data.to);
      if (peer) {
        io.to(peer.socketId).emit("ice_candidate", {
          candidate: data.candidate,
        });
      }
    });

    socket.on("disconnect", () => {
      const idx = onlineUsers.findIndex((u) => u.socketId === socket.id);
      if (idx !== -1) {
        console.log(`🔴 User ${onlineUsers[idx].userId} offline`);
        onlineUsers.splice(idx, 1);
      }
    });
  });

  return httpServer;
}
