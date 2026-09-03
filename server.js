const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

const connectDb = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const permitRoutes = require("./routes/permitRoutes");
const adminRoutes = require("./routes/adminRoutes");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const {
  generalLimiter,
  authLimiter,
  permitLimiter,
} = require("./middleware/rateLimitMiddleware");

dotenv.config();

const app = express();

// ==============================
// DATABASE
// ==============================
connectDb();

// ==============================
// MIDDLEWARE
// ==============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// STATIC FRONTEND
// ==============================
app.use(express.static(path.join(__dirname, "public")));

// ==============================
// UPLOADS
// ==============================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==============================
// API ROUTES
// ==============================
app.use(generalLimiter);
app.use("/api/auth",authLimiter, authRoutes);
app.use("/api/permits",permitLimiter, permitRoutes);
app.use("/api/admin", adminRoutes);

// ==============================
// FRONTEND ROUTES
// ==============================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/permit-application", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "permit-application.html"));
});

app.get("/admin-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-dashboard.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "profile.html"));
});

app.get("/user-management", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "user-management.html"));
});

// ==============================
// ERROR HANDLING
// ==============================
app.use(notFound);
app.use(errorHandler);

// ==============================
// SERVER
// ==============================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
