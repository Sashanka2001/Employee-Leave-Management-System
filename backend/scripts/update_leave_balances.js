import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const defaults = { ANNUAL: 5, CASUAL: 5, MEDICAL: 5 };

async function run() {
  try {
    await connectDB();
    console.log('Updating all user leave balances to:', defaults);
    const res = await User.updateMany({}, { $set: { leaveBalance: defaults } });
    console.log('Update result:', res);
    process.exit(0);
  } catch (err) {
    console.error('Failed to update leave balances', err);
    process.exit(1);
  }
}

run();
