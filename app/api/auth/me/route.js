import jwt from "jsonwebtoken";

export async function GET(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return Response.json(null);

  const user = jwt.verify(token, process.env.JWT_SECRET);
  return Response.json(user);
}
