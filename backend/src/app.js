const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3001",
  process.env.BACKEND_URL || "http://localhost:4000",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get("/", (req, res) => {
  res.json({ message: "Roof Service API is running" });
});

// Admin routes (before API routes)
const adminRoutes = require('./routes/admin.routes');
app.use('/admin', adminRoutes);

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;


