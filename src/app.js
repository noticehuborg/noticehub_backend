require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const idempotency = require('./middleware/idempotency');
const commentRoutes = require('./routes/comment.routes');
const resourceRoutes = require('./routes/resource.routes');
const levelCorrectionRoutes = require('./routes/levelcorrection.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');
const announcementRoutes = require('./routes/announcement.routes');
const fileRoutes = require('./routes/file.routes');

const app = express();

// CORS
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,           // e.g. https://noticehub.vercel.app
  'http://localhost:5173',            // local dev
  'http://localhost:4173',            // vite preview
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return cb(null, true);
    // Allow any Vercel preview deployment for this project
    if (/\.vercel\.app$/.test(origin) || ALLOWED_ORIGINS.includes(origin)) {
      return cb(null, true);
    }
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Rate limiting — higher cap in development so normal testing doesn't get blocked
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ status: 'error', message: 'Too many requests. Please slow down and try again later.' });
  },
});
app.use(limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Idempotency — must come after body parsing, before routes
app.use(idempotency);

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
app.use('/api/files', fileRoutes);

// 404
app.use((req, res) => res.status(404).json({ status: 'error', message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

module.exports = app;
