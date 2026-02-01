import { connectDB } from "@/lib/db";
import Inform from "@/models/Inform";
import Tool from "@/models/Tool";
import { verifyToken } from "@/lib/auth";

export async function POST(req) {
  await connectDB();
  const auth = verifyToken(req);
  const data = await req.json();

  const tool = await Tool.findById(data.tool);
  if (!tool.modules.includes(data.module)) {
    return Response.json({ error: "Invalid module" }, { status: 400 });
  }

  const inform = await Inform.create({
    ...data,
    createdBy: auth.id,
    lastEditedBy: auth.id
  });

  return Response.json(inform);
}

export async function GET(req) {
  await connectDB();

  let auth;
  try {
    auth = verifyToken(req);
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // admin + user can read
  if (auth.role !== "admin" && auth.role !== "user") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const informs = await Inform.find()
    .populate("tool", "toolNumber toolId client bayArea modules")
    .populate("createdBy", "name email")
    .populate("lastEditedBy", "name email")
    .sort({ createdAt: -1 });

  return Response.json(informs);
}
