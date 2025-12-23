import express from "express";
import Notification from "../models/Notification.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.put("/:id/read", auth, async (req, res) => {
  try {
    const note = await Notification.findById(req.params.id);
    if (!note) return res.status(404).json({ msg: "Not found" });
    if (String(note.user) !== String(req.user._id)) return res.status(403).json({ msg: "Forbidden" });
    note.read = true;
    await note.save();
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
