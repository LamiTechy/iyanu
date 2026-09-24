import { NextResponse } from "next/server";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const result = await db.select().from(courses);
  return NextResponse.json({ courses: result });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { code, title, description, lecturerId } = await request.json();
  if (!code || !title) {
    return NextResponse.json({ error: "Code and title required" }, { status: 400 });
  }

  const [course] = await db.insert(courses).values({
    code,
    title,
    description: description || "",
    lecturerId: lecturerId || null,
  }).returning();

  return NextResponse.json({ course }, { status: 201 });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, code, title, description, lecturerId } = await request.json();
  const updateData: Record<string, unknown> = {};
  if (code) updateData.code = code;
  if (title) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (lecturerId !== undefined) updateData.lecturerId = lecturerId;

  const [updated] = await db.update(courses).set(updateData).where(eq(courses.id, id)).returning();
  return NextResponse.json({ course: updated });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await request.json();
  await db.delete(courses).where(eq(courses.id, id));
  return NextResponse.json({ success: true });
}
