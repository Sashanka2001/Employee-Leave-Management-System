import mongoose from "mongoose";

const LeaveTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    defaultDaysPerYear: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("LeaveType", LeaveTypeSchema);
