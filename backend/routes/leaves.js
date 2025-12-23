import express from "express";
import LeaveRequest from "../models/LeaveRequest.js";
import LeaveType from "../models/LeaveType.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { auth, admin } from "../middleware/auth.js";

const router = express.Router();

function daysBetweenInclusive(a, b) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utc2 - utc1) / _MS_PER_DAY) + 1;
}

router.post("/", auth, async (req, res) => {
  try {
    const { typeId, startDate, endDate, reason } = req.body;
    if (!typeId || !startDate || !endDate) return res.status(400).json({ msg: "Missing fields" });
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) return res.status(400).json({ msg: "Cannot apply for past dates" });
    if (end < start) return res.status(400).json({ msg: "End date must be after start date" });
    const type = await LeaveType.findById(typeId);
    if (!type) return res.status(400).json({ msg: "Invalid leave type" });
    const days = daysBetweenInclusive(start, end);
    const user = await User.findById(req.user._id);
    const key = type.name.toUpperCase();
    const balance = user.leaveBalance.get(key) ?? 0;
    if (balance < days) return res.status(400).json({ msg: "Insufficient leave balance" });
    const leave = new LeaveRequest({ user: user._id, type: type._id, startDate: start, endDate: end, days, reason });
    await leave.save();

      // notify admins about new leave request
      try {
        const admins = await User.find({ role: "ADMIN" });
        const msg = `New leave request from ${user.name} (${user.email}) for ${type.name} ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
        const notifs = admins.map(a => ({ user: a._id, message: msg }));
        if (notifs.length) await Notification.insertMany(notifs);
      } catch (e) {
        console.error("Notify admins failed", e);
      }
    res.json(leave);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/my", auth, async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ user: req.user._id }).populate("type");
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/", auth, admin, async (req, res) => {
  try {
    const filter = {};
    const { typeId, status, userId } = req.query;
    if (typeId) filter.type = typeId;
    if (status) filter.status = status;
    if (userId) filter.user = userId;
    const leaves = await LeaveRequest.find(filter).populate("user", "name email").populate("type");
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.put("/:id/decision", auth, admin, async (req, res) => {
  try {
    const { decision, comment } = req.body; // 'APPROVED' or 'REJECTED' and optional admin comment
    if (!["APPROVED", "REJECTED"].includes(decision)) return res.status(400).json({ msg: "Invalid decision" });
    const leave = await LeaveRequest.findById(req.params.id).populate("type");
    if (!leave) return res.status(404).json({ msg: "Leave request not found" });
    if (leave.status !== "PENDING") return res.status(400).json({ msg: "Request already decided" });
    leave.status = decision;
    if (comment) leave.adminComment = comment;
    leave.decidedAt = new Date();
    leave.decidedBy = req.user._id;
    await leave.save();
    if (decision === "APPROVED") {
      const user = await User.findById(leave.user);
      const key = leave.type.name.toUpperCase();
      const balance = user.leaveBalance.get(key) ?? 0;
      user.leaveBalance.set(key, Math.max(0, balance - leave.days));
      await user.save();
    }
    // create notification for the user about approval/rejection
    try {
      let msg = `Your leave request (${leave.type?.name || ''} ${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()}) was ${decision}.`;
      if (comment) msg += `\nComment: ${comment}`;
      await Notification.create({ user: leave.user, message: msg });
    } catch (e) {
      console.error("Create user notification failed", e);
    }
    res.json(leave);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Monthly report for admin
router.get("/report", auth, admin, async (req, res) => {
  try {
    const { month } = req.query; // expected format YYYY-MM
    let start, end;
    if (month) {
      const [y, m] = month.split("-").map(Number);
      start = new Date(y, m - 1, 1);
      end = new Date(y, m, 0, 23, 59, 59, 999);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const leaves = await LeaveRequest.find({ startDate: { $gte: start, $lte: end } }).populate("type").populate("user", "name email");

    const report = {
      month: start.toISOString().slice(0, 7),
      totalRequests: leaves.length,
      byStatus: { PENDING: 0, APPROVED: 0, REJECTED: 0 },
      byType: {},
      byUser: {},
      totalDaysRequested: 0,
      totalDaysApproved: 0,
    };

    for (const l of leaves) {
      report.byStatus[l.status] = (report.byStatus[l.status] || 0) + 1;
      const tname = l.type ? l.type.name : "UNKNOWN";
      if (!report.byType[tname]) report.byType[tname] = { requestedDays: 0, approvedDays: 0, count: 0 };
      report.byType[tname].requestedDays += l.days;
      if (l.status === "APPROVED") report.byType[tname].approvedDays += l.days;
      report.byType[tname].count += 1;

      const uname = l.user ? `${l.user.name} <${l.user.email}>` : String(l.user);
      if (!report.byUser[uname]) report.byUser[uname] = { requestedDays: 0, approvedDays: 0, count: 0 };
      report.byUser[uname].requestedDays += l.days;
      if (l.status === "APPROVED") report.byUser[uname].approvedDays += l.days;
      report.byUser[uname].count += 1;

      report.totalDaysRequested += l.days;
      if (l.status === "APPROVED") report.totalDaysApproved += l.days;
    }

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
