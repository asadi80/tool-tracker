import jwt from "jsonwebtoken";

export function verifyToken(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    throw new Error("NO_TOKEN");
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new Error("INVALID_TOKEN");
  }
}
