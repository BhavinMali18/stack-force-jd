require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const roleRoutes = require('./routes/role.routes');
const candidateRoutes = require('./routes/candidate.routes');
const emailRoutes = require('./routes/email.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// --- Metrics Middleware ---
app.use((req, res, next) => {
  // Notify master process that a request started
  if (process.send) {
    process.send({ cmd: 'REQUEST_START', path: req.path });
  }

  res.on('finish', () => {
    // Notify master process that a request completed
    if (process.send) {
      process.send({ cmd: 'REQUEST_END', path: req.path, status: res.statusCode });
    }
  });

  next();
});

// --- Middleware ---
const ALLOWED_ORIGINS = [
  'https://xstudio.blog',
  'https://www.xstudio.blog',
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, etc.)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Serve uploaded resumes statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- Routes ---
app.get('/', (req, res) => res.send('TalentForce JD API is running...'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date(), worker: process.pid }));
app.use('/api/auth', authRoutes);
app.use('/api', roleRoutes);
app.use('/api', candidateRoutes);
app.use('/api/email', emailRoutes);

// --- Error Handler (must be last) ---
app.use(errorHandler);

module.exports = app;
