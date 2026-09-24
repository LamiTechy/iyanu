import { NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { subscription } = await request.json();
    if (!subscription) {
      return NextResponse.json({ error: "Subscription required" }, { status: 400 });
    }

    const existing = await db.select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user.userId))
      .limit(1);

    if (existing.length > 0) {
      await db.update(pushSubscriptions)
        .set({ subscription: JSON.stringify(subscription) })
        .where(eq(pushSubscriptions.userId, user.userId));
    } else {
      await db.insert(pushSubscriptions).values({
        userId: user.userId,
        subscription: JSON.stringify(subscription),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.userId, user.userId));
  return NextResponse.json({ success: true });
}
