import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// In your POST (login) function
export async function POST(req) {
  await connectDB();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Missing credentials" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // ✅ Check if account is active
    if (!user.isActive) {
      return Response.json({ 
        error: "Account is disabled. Please contact administrator." 
      }, { status: 403 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // ✅ Check if password needs to be changed (false = needs change)
    if (!user.passwordChanged) {
      const tempToken = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          requiresPasswordChange: true, // ✅ Flag to indicate forced change
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      return Response.json({
        token: tempToken,
        requiresPasswordChange: true,
        message: "Password change required",
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
        }
      });
    }

    // Normal login - password already changed
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return Response.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ 
      error: "An error occurred during login. Please try again." 
    }, { status: 500 });
  }
}

//------------------------------PUT-------------------------------------------
export async function PUT(req) {
  await connectDB();

  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return Response.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // Read request body once
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword) {
      return Response.json(
        { error: "New password is required" },
        { status: 400 },
      );
    }

    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // If requiresPasswordChange flag is set, skip current password check
    let skipCurrentPasswordCheck = false;
    if (decoded.requiresPasswordChange) {
      skipCurrentPasswordCheck = true;
    }

    if (!skipCurrentPasswordCheck) {
      // Current password is required for normal password change
      if (!currentPassword) {
        return Response.json(
          { error: "Current password is required" },
          { status: 400 },
        );
      }

      // Verify current password for normal password change
      const validPassword = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!validPassword) {
        return Response.json(
          { error: "Current password is incorrect" },
          { status: 401 },
        );
      }
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return Response.json(
        {
          error: "Password must be at least 6 characters long",
        },
        { status: 400 },
      );
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // ✅ CORRECTED: Update password and mark as changed
    user.password = hashed;
    user.passwordChanged = true; // ✅ User has now changed their password
    await user.save();

    // If this was a forced password change, generate a new regular token
    let newToken;
    if (decoded.requiresPasswordChange) {
      newToken = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          // ✅ Removed passwordChanged from token payload - it's not needed
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );
    }

    return Response.json({
      message: "Password changed successfully",
      token: newToken || token, // Return new token if forced change, otherwise keep same
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Change password error:", error);
    return Response.json(
      {
        error: "An error occurred while changing password. Please try again.",
      },
      { status: 500 },
    );
  }
}
