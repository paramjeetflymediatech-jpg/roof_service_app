const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const MySQLStore = require('connect-mysql');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express(); 
// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('view cache', false); // Disable view caching for development

// Static files
app.use(express.static(path.join(__dirname, '../public')));

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3001",
  "http://localhost:3000", // Add frontend local port
  "exp://localhost:8081", // React Native Expo
  "exp://127.0.0.1:8081", // React Native localhost
  process.env.BACKEND_URL || "http://localhost:5000",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'roof-service-secret-key-123',
  resave: false,
  saveUninitialized: false,
  // store: new MySQLStore({
  //   config: {
  //     host: process.env.MYSQL_HOST || 'localhost',
  //     port: process.env.MYSQL_PORT || 3306,
  //     user: process.env.MYSQL_USER || 'root',
  //     password: process.env.MYSQL_PASSWORD || 'Param@1102',
  //     database: process.env.MYSQL_DATABASE || 'roof_service'
  //   },
  //   table: 'sessions',
  //   ttl: 86400 // 1 day in seconds
  // }),
  cookie: {
    secure: false, // false for localhost
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

// Flash messages middleware
app.use(flash());

// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  next();
});

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get("/", (req, res) => {
  res.json({ message: "Roof Service API is running" });
});

// Admin routes (MUST be after session middleware)
app.use('/admin', require('./routes/admin.routes'));

// API routes
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
