require('dotenv').config();
require('express-async-errors');

const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Server: SocketIO } = require('socket.io');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const roleRoutes = require('./routes/role.routes');
const candidateRoutes = require('./routes/candidate.routes');
const emailRoutes = require('./routes/email.routes');
const storageRoutes = require('./routes/storage.routes');
const queueRoutes = require('./routes/queue.routes');
const poolRoutes = require('./routes/pool.routes');
const { errorHandler } = require('./middleware/error.middleware');
const { startPoolWorker } = require('./workers/poolWorkerInline');
const { startResumeWorker } = require('./workers/resumeWorkerInline');

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Serve uploaded resumes statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── HTTP Server + Socket.io ────────────────────────────────
// We wrap Express in an HTTP server so Socket.io can share the same port.
// In production: Socket.io uses a Redis adapter so all API pods share the
// same pub/sub channel. Locally we use in-process event emitter.
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Attach io to app so routes can access it via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  // Client joins a "role room" to receive updates only for their job
  socket.on('join-role', (roleId) => {
    socket.join(`role:${roleId}`);
  });

  socket.on('join-company', (companyId) => {
    socket.join(`company:${companyId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [Socket] Client ${socket.id} disconnected`);
  });
});

// ── Internal route: Worker → API → Browser ─────────────────
// The resume worker calls this endpoint when a job finishes.
// The API server then broadcasts to all sockets in the role's room.
// This is the local equivalent of "Redis Pub/Sub → Socket.io adapter".

// Pool worker notifies when a pool resume finishes
app.post('/internal/pool-job-done', express.json(), (req, res) => {
  const { poolResumeId, companyId, name, skillCount } = req.body;
  // Broadcast to company room (all recruiter tabs)
  io.to(`company:${companyId}`).emit('pool:resume-processed', {
    poolResumeId, name, skillCount, timestamp: new Date().toISOString(),
  });
  res.sendStatus(200);
});

// Resume worker notifies when a role-specific resume finishes
app.post('/internal/job-done', express.json(), (req, res) => {
  const { candidateId, roleId, score, name } = req.body;
  if (roleId) {
    io.to(`role:${roleId}`).emit('candidate:processed', {
      candidateId,
      score,
      name,
      timestamp: new Date().toISOString(),
    });
  }
  res.sendStatus(200);
});

// ── Public Routes ──────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ 
  status: 'ok', 
  architecture: 'event-driven (BullMQ + Socket.io)',
  timestamp: new Date() 
}));

app.use('/api/auth', authRoutes);
app.use('/api', roleRoutes);
app.use('/api', candidateRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/pool', poolRoutes);       // Talent Pool
app.use('/api', poolRoutes);            // /api/roles/:id/suggestions + suggest-add

// ── Error Handler ──────────────────────────────────────────
app.use(errorHandler);

// ── Boot ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  // Start inline workers (same process, no Redis needed)
  startResumeWorker(io);
  startPoolWorker(io);

  server.listen(PORT, () => {
    console.log(`\n🚀 TalentForce JD API   → http://localhost:${PORT}`);
    console.log(`📡 Socket.io            → ws://localhost:${PORT}`);
    console.log(`📊 Queue Status         → http://localhost:${PORT}/api/queue/status`);
    console.log(`🗄️  Talent Pool          → http://localhost:${PORT}/api/pool`);
    console.log(`🐍 Python Parser        → http://localhost:8000 (optional, Node.js fallback active)\n`);
  });
});
