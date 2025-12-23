import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import leaveTypeRoutes from "./routes/leaveTypes.js";
import leaveRoutes from "./routes/leaves.js";
import notificationRoutes from "./routes/notifications.js";
import LeaveType from "./models/LeaveType.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Leave Management API Running"));

app.use("/api/auth", authRoutes);
app.use("/api/leavetypes", leaveTypeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;

const seedLeaveTypes = async () => {
  try {
    const count = await LeaveType.countDocuments();
    if (count === 0) {
      await LeaveType.create([
        { name: "ANNUAL", defaultDaysPerYear: 12 },
        { name: "CASUAL", defaultDaysPerYear: 7 },
        { name: "MEDICAL", defaultDaysPerYear: 10 },
      ]);
      console.log("Seeded default leave types");
    }
  } catch (err) {
    console.error("Seeding error", err);
  }
};


const start = async () => {
  try {
    await connectDB();
    await seedLeaveTypes();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

start();
