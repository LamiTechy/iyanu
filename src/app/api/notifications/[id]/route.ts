import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const notificationId = parseInt(id);

  const [existing] = await db.select().from(notifications).where(eq(notifications.id, notificationId)).limit(1);
  if (!existing || existing.userId !== user.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [updated] = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId)).returning();
  return NextResponse.json({ notification: updated });
}
