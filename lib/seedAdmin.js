// lib/seedAdmin.js
import bcrypt from "bcryptjs";
import User from "@/models/User";

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn("⚠ ADMIN_EMAIL or ADMIN_PASSWORD missing");
    return;
  }

  const exists = await User.findOne({ email });
  if (exists) return;

  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name: "System Admin",
    email,
    password: hash,
    role: "admin",
    isActive: true, // true = can login, false = disabled
    passwordChanged: false, // false = needs to change password on first login
  });

  console.log("✅ Admin user seeded");
}
