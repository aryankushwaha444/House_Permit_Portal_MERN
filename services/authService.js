const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const presentUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
});
async function register(data) {
  if (await User.findOne({ email: data.email }))
    throw Object.assign(new Error("Email already registered"), {
      statusCode: 400,
    });
  const user = await User.create(data);
  return { token: generateToken(user._id), user: presentUser(user) };
}
async function login(email, password) {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    throw Object.assign(new Error("Invalid email or password"), {
      statusCode: 401,
    });
  return { token: generateToken(user._id), user: presentUser(user) };
}
module.exports = { register, login, presentUser };
