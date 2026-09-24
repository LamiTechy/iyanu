import { NextResponse } from "next/server";
import { db } from "@/db";
import { alerts, assignments, courses } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role === "student") {
    const result = await db.select({
      alert: alerts,
      assignment: { id: assignments.id, title: assignments.title, deadline: assignments.deadline },
      course: { code: courses.code, title: courses.title },
    }).from(alerts)
      .leftJoin(assignments, eq(alerts.assignmentId, assignments.id))
      .leftJoin(courses, eq(assignments.courseId, courses.id))
      .where(eq(alerts.studentId, user.userId))
      .orderBy(desc(alerts.generatedAt));

    return NextResponse.json({ alerts: result });
  }

  if (user.role === "lecturer") {
    const result = await db.select({
      alert: alerts,
      assignment: { id: assignments.id, title: assignments.title },
    }).from(alerts)
      .leftJoin(assignments, eq(alerts.assignmentId, assignments.id))
      .where(eq(assignments.lecturerId, user.userId))
      .orderBy(desc(alerts.generatedAt));

    return NextResponse.json({ alerts: result });
  }

  const result = await db.select().from(alerts).orderBy(desc(alerts.generatedAt));
  return NextResponse.json({ alerts: result });
}
