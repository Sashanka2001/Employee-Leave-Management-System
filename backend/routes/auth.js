import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import LeaveRequest from "../models/LeaveRequest.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: "Missing fields" });
    // If registering as EMPLOYEE, enforce password complexity
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
    if ((role || "EMPLOYEE") === "EMPLOYEE" && !pwdRegex.test(password)) {
      return res.status(400).json({ msg: "Password must be at least 8 characters and include uppercase, lowercase, and a special character." });
    }
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hash, role: role || "EMPLOYEE" });
    await user.save();
    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Missing fields" });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Return stored/persisted leave balance (user.leaveBalance is updated on approvals)
    const leaveBalance = user.leaveBalance ? Object.fromEntries(user.leaveBalance) : {};
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, leaveBalance } });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
