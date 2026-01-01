import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/User.js"; // adjust path if needed

dotenv.config(); 

async function run() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI); // debug
    await mongoose.connect(process.env.MONGO_URI);

    const admins = await User.find({ role: "admin" }).select("+password");
    console.log("Admins in DB:", admins);
    process.exit(0);
  } catch (err) {
    console.error("Error checking admins:", err);
    process.exit(1);
  }
}

run();