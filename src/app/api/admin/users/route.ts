import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const result = await db.select().from(users).orderBy(asc(users.fullName));
  return NextResponse.json({ users: result });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, isActive, role } = await request.json();

  const updateData: Record<string, unknown> = {};
  if (isActive !== undefined) updateData.isActive = isActive;
  if (role) updateData.role = role;

  const [updated] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
  return NextResponse.json({ user: updated });
}
