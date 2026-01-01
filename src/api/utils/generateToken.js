// utils/generateToken.js
import { SignJWT } from "jose";

export const generateToken = async (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be defined in .env");
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  return await new SignJWT({ id: user._id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(process.env.JWT_EXPIRE || "7d")
    .sign(secret);
};