import { NextResponse } from "next/server";
import { db } from "@/db";
import { assignments, courses, progress, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const assignmentId = parseInt(id);

  const result = await db.select({
    assignment: assignments,
    course: courses,
  }).from(assignments)
    .leftJoin(courses, eq(assignments.courseId, courses.id))
    .where(eq(assignments.id, assignmentId))
    .limit(1);

  if (result.length === 0) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  if (user.role === "lecturer" && result[0].assignment.lecturerId !== user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let studentProgress = null;
  if (user.role === "student") {
    const [prog] = await db.select().from(progress)
      .where(and(eq(progress.assignmentId, assignmentId), eq(progress.studentId, user.userId)))
      .limit(1);
    studentProgress = prog || null;
  }

  return NextResponse.json({ ...result[0], studentProgress });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "lecturer" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const assignmentId = parseInt(id);

  const [existing] = await db.select().from(assignments).where(eq(assignments.id, assignmentId)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.role === "lecturer" && existing.lecturerId !== user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const updateData: Record<string, unknown> = {};
  if (body.title) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.deadline) updateData.deadline = new Date(body.deadline);
  if (body.weight) updateData.weight = body.weight;
  if (body.attachmentUrl !== undefined) updateData.attachmentUrl = body.attachmentUrl;

  const [updated] = await db.update(assignments).set(updateData).where(eq(assignments.id, assignmentId)).returning();
  return NextResponse.json({ assignment: updated });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "lecturer" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const assignmentId = parseInt(id);

  const [existing] = await db.select().from(assignments).where(eq(assignments.id, assignmentId)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.role === "lecturer" && existing.lecturerId !== user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(assignments).where(eq(assignments.id, assignmentId));
  return NextResponse.json({ success: true });
}
