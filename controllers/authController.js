const authService = require("../services/authService");
async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ message: "Registration successful", ...result });
  } catch (error) {
    next(error);
  }
}
async function login(req, res, next) {
  try {
    if (!req.body.email || !req.body.password)
      return res.status(400).json({ error: "Email and password are required" });
    const result = await authService.login(req.body.email, req.body.password);
    res.json({ message: "Login successful", ...result });
  } catch (error) {
    next(error);
  }
}
function verify(req, res) {
  res.json({
    message: "Token is valid",
    user: authService.presentUser(req.user),
  });
}
module.exports = { register, login, verify };
