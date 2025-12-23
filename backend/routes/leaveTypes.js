import express from "express";
import LeaveType from "../models/LeaveType.js";
import { auth, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const types = await LeaveType.find();
    res.json(types);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post("/", auth, admin, async (req, res) => {
  try {
    const { name, defaultDaysPerYear } = req.body;
    if (!name) return res.status(400).json({ msg: "Name required" });
    let existing = await LeaveType.findOne({ name });
    if (existing) return res.status(400).json({ msg: "Leave type exists" });
    const type = new LeaveType({ name, defaultDaysPerYear: defaultDaysPerYear || 0 });
    await type.save();
    res.json(type);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
