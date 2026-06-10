import { Server } from 'socket.io';
import { createServer } from 'http';
export function setupSocket(app: any) {
  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: '*' } });
  io.on('connection', (socket) => {
    socket.on('join_room', (id: number) => socket.join(`conv_${id}`));
    socket.on('send_message', (d: any) => io.to(`conv_${d.conversationId}`).emit('new_message', { ...d, createdAt: new Date().toISOString() }));
    socket.on('disconnect', () => {});
  });
  return httpServer;
}
