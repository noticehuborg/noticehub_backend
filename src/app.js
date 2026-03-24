require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const commentRoutes = require('./routes/comment.routes');
const resourceRoutes = require('./routes/resource.routes');
const levelCorrectionRoutes = require('./routes/levelcorrection.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');
const announcementRoutes = require('./routes/announcement.routes');

const app = express();

console.log({
  authRoutes,
  userRoutes,
  levelCorrectionRoutes,
  resourceRoutes,
  commentRoutes,
  adminRoutes
});

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', levelCorrectionRoutes); // level corrections
app.use('/api/resources', resourceRoutes); // resources
app.use('/api', commentRoutes); // comments — spans /announcements/:id/comments and /comments/:id
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);

// 404
app.use((req, res) => res.status(404).json({ status: 'error', message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

module.exports = app;
