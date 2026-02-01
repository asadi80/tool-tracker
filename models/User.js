import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["admin", "user"], default: "user" },
  isActive: { type: Boolean, default: true }, // true = can login, false = disabled
  passwordChanged: { type: Boolean, default: false } // false = needs to change password on first login
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);