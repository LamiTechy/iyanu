import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db.select().from(notifications)
    .where(eq(notifications.userId, user.userId))
    .orderBy(desc(notifications.sentAt))
    .limit(50);

  return NextResponse.json({ notifications: result });
}
