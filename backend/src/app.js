const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Session configuration
app.use(
  session({
    name: 'admin.sid',
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
      secure: false, // Set to false for localhost development
      sameSite: 'lax',
    },
  })
);


// Flash messages
app.use(flash());

// Global variables for views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.userId || null;
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Roof Service API is running' });
});

// Admin routes (before API routes)
const adminRoutes = require('./routes/admin.routes');
app.use('/admin', adminRoutes);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;


