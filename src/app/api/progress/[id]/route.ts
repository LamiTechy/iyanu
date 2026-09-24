import { NextResponse } from "next/server";
import { db } from "@/db";
import { progress, assignments, users, submissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const assignmentId = parseInt(id);

  if (user.role === "lecturer" || user.role === "admin") {
    const results = await db.select({
      progress: progress,
      student: { id: users.id, fullName: users.fullName, matricNo: users.matricNo },
      submission: { id: submissions.id, fileUrl: submissions.fileUrl, submittedAt: submissions.submittedAt, isLate: submissions.isLate },
    }).from(progress)
      .leftJoin(users, eq(progress.studentId, users.id))
      .leftJoin(submissions, and(eq(submissions.assignmentId, progress.assignmentId), eq(submissions.studentId, progress.studentId)))
      .where(eq(progress.assignmentId, assignmentId));

    return NextResponse.json({ progressList: results });
  }

  const [prog] = await db.select().from(progress)
    .where(and(eq(progress.assignmentId, assignmentId), eq(progress.studentId, user.userId)))
    .limit(1);

  return NextResponse.json({ progress: prog || null });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "student") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const assignmentId = parseInt(id);
  const { status, percentComplete } = await request.json();

  const [existing] = await db.select().from(progress)
    .where(and(eq(progress.assignmentId, assignmentId), eq(progress.studentId, user.userId)))
    .limit(1);

  const updateData: Record<string, unknown> = {
    lastUpdated: new Date(),
  };
  if (status) updateData.status = status;
  if (percentComplete !== undefined) updateData.percentComplete = percentComplete;

  if (existing) {
    const [updated] = await db.update(progress)
      .set(updateData)
      .where(eq(progress.id, existing.id))
      .returning();
    return NextResponse.json({ progress: updated });
  }

  const [created] = await db.insert(progress).values({
    assignmentId,
    studentId: user.userId,
    status: status || "not_started",
    percentComplete: percentComplete || 0,
  }).returning();

  return NextResponse.json({ progress: created }, { status: 201 });
}
