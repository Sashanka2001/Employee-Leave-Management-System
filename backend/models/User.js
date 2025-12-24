import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: { type: String, enum: ["EMPLOYEE", "ADMIN"], default: "EMPLOYEE" },
		leaveBalance: {
			type: Map,
			of: Number,
			// default balances updated; MEDICAL set to 10
			default: { ANNUAL: 5, CASUAL: 5, MEDICAL: 10 },
		},
	},
	{ timestamps: true }
);

export default mongoose.model("User", UserSchema);
