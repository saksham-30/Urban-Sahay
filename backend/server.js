require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const providerRoutes = require('./routes/providers');
const concernRoutes = require('./routes/concerns');
const conversationRoutes = require('./routes/conversations');
const kycRoutes = require('./routes/kyc');

const app = express();
const httpServer = http.createServer(app);

const defaultOrigins = ['http://localhost:8080', 'http://localhost:8081'];
const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (like curl/postman/mobile apps).
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};

// Socket.io for real-time chat
const io = new Server(httpServer, {
  cors: corsOptions,
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/concerns', concernRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/kyc', kycRoutes);

// Socket.io events for real-time messaging
io.on('connection', (socket) => {
  // Join a conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
  });

  // Leave a conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
  });

  // New message event
  socket.on('send_message', (message) => {
    // Broadcast to everyone in the room except sender
    socket.to(message.conversation_id).emit('new_message', message);
  });

  socket.on('disconnect', () => {});
});

// Attach io to app so routes can emit events
app.set('io', io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Urban Sahay backend running on port ${PORT}`);
});
