const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDb = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const permitRoutes = require("./routes/permitRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/dashboard.html", (req, res) => res.redirect(302, "/dashboard/"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/permits", permitRoutes);
app.use("/api/admin", adminRoutes);
app.get("/dashboard/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "dashboard.html"))
);
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 3000;
connectDb().then(() =>
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
);
