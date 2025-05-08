import { Server } from 'socket.io';

let io;

export default function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('⚡ User connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`✅ User ${userId} joined room`);
    });

    socket.on('disconnect', () => {
      console.log('🔌 User disconnected');
    });
  });

  return io;
}

export const getIo = () => io;
