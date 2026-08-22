import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import opportunityRoutes from './routes/opportunityRoutes.js';
import savedRoutes from './routes/savedRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: [
    'https://campus-launch-pad.vercel.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads directory for profile images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// -------------------------------------------------------------
// Health Check Endpoint
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  res.status(200).json({
    status: 'ok',
    message: 'Campus Launch Pad API is running',
    database: dbStatusMap[dbState] || 'Unknown',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
});

// Root route friendly message
app.get('/', (req, res) => {
  res.json({
    name: 'Campus Launch Pad API',
    version: '1.0.0',
    description: 'Backend services for Campus Launch Pad student opportunity platform',
    healthCheck: '/api/health',
  });
});

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/invitations', invitationRoutes);

// Dev maintenance endpoint to clean automated test records without affecting real users
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/clean-test-data', async (req, res) => {
    try {
      const User = (await import('./models/User.js')).default;
      const StudentProfile = (await import('./models/StudentProfile.js')).default;
      const Project = (await import('./models/Project.js')).default;
      const Invitation = (await import('./models/Invitation.js')).default;

      // Find automated test users created by test scripts
      const testUsers = await User.find({
        email: { $regex: /^(siddhi_|alina_|alex_|bob_|test_)/i },
      });

      const userIds = testUsers.map((u) => u._id);

      await Invitation.deleteMany({
        $or: [
          { sender: { $in: userIds } },
          { recipient: { $in: userIds } },
          { student: { $in: userIds } },
          { creator: { $in: userIds } },
        ],
      });

      await Project.deleteMany({ creator: { $in: userIds } });
      await StudentProfile.deleteMany({ user: { $in: userIds } });
      const delUsers = await User.deleteMany({ _id: { $in: userIds } });

      res.json({
        status: 'success',
        message: `Cleaned up ${delUsers.deletedCount} automated test user(s) and their associated projects and invitations.`,
        deletedCount: delUsers.deletedCount,
      });
    } catch (err) {
      console.error('Error cleaning test data:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  app.get('/api/dev/all-data', async (req, res) => {
    try {
      const User = (await import('./models/User.js')).default;
      const Project = (await import('./models/Project.js')).default;
      const users = await User.find({}, 'name email role');
      const projects = await Project.find({}, 'title creator');
      res.json({ users, projects });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// -------------------------------------------------------------
// 404 Handler for Undefined Routes
// -------------------------------------------------------------
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// -------------------------------------------------------------
// Global Centralized Error Handling Middleware
// -------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 Campus Launch Pad Server running on port ${PORT}`);
  console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Allowed Client URL: ${CLIENT_URL}`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('====================================================');
});

export default app;
