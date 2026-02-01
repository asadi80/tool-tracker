import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
//--------------------------GET--------------------------------

export async function POST(req) {
  await connectDB();
  const auth = verifyToken(req);
  if (auth.role !== "admin")
    return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const hashed = await bcrypt.hash(body.password, 10);

  const user = await User.create({
    ...body,
    password: hashed,
    isActive: true,
    passwordChanged: false,
  });
  return Response.json(user);
}

export async function GET(req) {
  await connectDB();

  const auth = verifyToken(req);
  if (!auth || auth.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await User.find().select("-password");
  return Response.json(users);
}
//--------------------------DELET--------------------------------

export async function DELETE(req) {
  await connectDB();

  const auth = verifyToken(req);
  if (!auth || auth.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Try to get ID from URL path (if using dynamic routes)
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    let id = pathParts[pathParts.length - 1];

    // If the last part doesn't look like an ObjectId, try query params
    if (!id || id === "users" || id.length !== 24) {
      id = url.searchParams.get("id");
    }

    if (!id) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      message: "User deleted successfully",
      user: { id: deletedUser._id, email: deletedUser.email },
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

//--------------------------PATCH-------------------------------

// Change from PUT to PATCH
export async function PATCH(req) {
  await connectDB();

  const auth = verifyToken(req);
  if (auth.role !== "admin")
    return Response.json({ error: "Forbidden" }, { status: 403 });

  try {
    // Get ID from query parameters (not pathname)
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    console.log("Updating user with ID:", id);
    
    const body = await req.json();
    const { isActive, password, ...updateData } = body;

    if (!id) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update object
    const updates = { ...updateData };

    // If admin is resetting password
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.password = hashed;
      updates.passwordChanged = false; // User needs to change it on next login
    }

    // If admin is changing active status
    if (isActive !== undefined) {
      updates.isActive = isActive;
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    return Response.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}


//--------------------------PUT-------------------------------
export async function PUT(req) {
  await connectDB();

  const auth = verifyToken(req);
  if (!auth || auth.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    let id = pathParts[pathParts.length - 1];

    if (!id || id === "users" || id.length !== 24) {
      id = url.searchParams.get("id");
    }

    if (!id) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // 🔑 read desired state from body
    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return Response.json(
        { error: "isActive must be true or false" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    console.error("Update user active state error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
