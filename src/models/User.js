import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3 },
  email: { type: String, required: true, unique: true, match: /.+@.+\..+/ },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  active: { type: Boolean, default: true },
  verified: { type: Boolean, default: false }, // email verification
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcryptjs.genSalt(12); // stronger salt
  this.password = await bcryptjs.hash(this.password, salt);
  next();
});
// Compare password method
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcryptjs.compare(plainPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
