const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const MySQLStore = require("express-mysql-session")(session);
const routes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();
// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("view cache", false); // Disable view caching for development

// Static files
app.use(express.static(path.join(__dirname, "../public"))); 

const allowedOrigins = [
  process.env.HOST_URL || "http://localhost:3000",
  process.env.FRONTEND_URL || "http://localhost:3001",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:8081",
  "exp://localhost:8081",
  "exp://127.0.0.1:8081",
  "http://10.0.2.2:8081",
  "http://10.0.2.2:5001",
  process.env.BACKEND_URL || "http://localhost:5001",
].filter(Boolean);

app.set('trust proxy', 1);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        console.log(`[CORS] Blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Global debug logger to identify where 403 is coming from
app.use((req, res, next) => {
  const oldJson = res.json;
  res.json = function(data) {
    if (res.statusCode === 403) {
      console.log(`[403 FORBIDDEN] Path: ${req.originalUrl} | Method: ${req.method} | IP: ${req.ip}`);
      console.log(`[403 FORBIDDEN] Response Data: ${JSON.stringify(data)}`);
    }
    return oldJson.apply(res, arguments);
  };
  next();
});


// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all API routes
// app.use("/api", limiter);

const sessionStore = new MySQLStore({
  host: process.env.MYSQL_HOST || "localhost",
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "root", // or "" if using XAMPP default
  database: process.env.MYSQL_DATABASE || "roof_service",
  // Optional: any other mysql2 options
});
// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "roof-service-secret-key-123",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: false, // false for localhost
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  }),
);

// Flash messages middleware
app.use(flash());

// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  next();
});

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/", (req, res) => {
  res.json({ message: "Roof Service API is running" });
});

// Admin routes (MUST be after session middleware)
app.use("/admin", require("./routes/admin.routes"));

// API routes
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
