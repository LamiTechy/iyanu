import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const payload = await getCurrentUser();
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db.select({
    id: users.id,
    fullName: users.fullName,
    email: users.email,
    role: users.role,
    matricNo: users.matricNo,
    staffId: users.staffId,
    department: users.department,
  }).from(users).where(eq(users.id, payload.userId)).limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
