require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');
const assignmentRoutes = require('./routes/assignments');
const submissionRoutes = require('./routes/submissions');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// CORS
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json());

// Rate-limit auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

const path = require('path');
const fs = require('fs');

// Serve frontend static files if present (Production / Unified Deployment)
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.get('/', (_, res) => res.json({ message: 'JoinEasy API Server Active', health: '/health' }));
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const initDB = require('./db/init');

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  await initDB();
});
