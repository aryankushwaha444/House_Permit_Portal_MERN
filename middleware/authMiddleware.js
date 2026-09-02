const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Check if Authorization header exists
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res
        .status(401)
        .json({ error: "No authorization header provided" });
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    // Extract and verify token
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token is expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return res.status(401).json({ error: "Token has expired" });
      }

      // Find user
      const user = await User.findOne({ _id: decoded.userId });
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Attach user and token to request
      req.user = user;
      req.token = token;
      next();
    } catch (jwtError) {
      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token" });
      }
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token has expired" });
      }
      throw jwtError;
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

module.exports = auth;
