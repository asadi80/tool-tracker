import { connectDB } from "@/lib/db";
import { seedAdmin } from "@/lib/seedAdmin";

export async function GET() {
  // await connectDB();
  await seedAdmin();

  return Response.json({ ok: true });
}
