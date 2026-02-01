import { connectDB } from "@/lib/db";
import Tool from "@/models/Tool";
import { verifyToken } from "@/lib/auth";

export async function POST(req) {
  await connectDB();

  let auth;
  try {
    auth = verifyToken(req);
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (auth.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await req.json();

  const exists = await Tool.findOne({
    $or: [{ toolNumber: data.toolNumber }, { toolId: data.toolId }],
  });

  if (exists) {
    return Response.json({ error: "Tool already exists" }, { status: 400 });
  }

  const tool = await Tool.create({
    ...data,
    createdBy: auth.id,
  });

  return Response.json(tool, { status: 201 });
}

export async function GET(req) {
  await connectDB();

  let auth;
  try {
    auth = verifyToken(req);
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ admin OR user
  if (auth.role !== "admin" && auth.role !== "user") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const tools = await Tool.find().sort({ createdAt: -1 });
  return Response.json(tools);
}