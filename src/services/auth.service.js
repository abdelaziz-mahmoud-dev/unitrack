const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const register = async ({ name, email, password }) => {
  const exists = await User.findOne({ email });
  if (exists) throw new AppError("Email already in use", 409);

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  return {
    user: { id: user._id, name: user.name, email: user.email },
    token: signToken(user._id),
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw new AppError("Invalid email or password", 401);

  return {
    user: { id: user._id, name: user.name, email: user.email },
    token: signToken(user._id),
  };
};

module.exports = { register, login };