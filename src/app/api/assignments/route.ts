import { NextResponse } from "next/server";
import { db } from "@/db";
import { assignments, courses } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  const status = searchParams.get("status");

  let query = db.select({
    assignment: assignments,
    course: courses,
  }).from(assignments)
    .leftJoin(courses, eq(assignments.courseId, courses.id));

  if (user.role === "lecturer") {
    query = query.where(eq(assignments.lecturerId, user.userId)) as typeof query;
  } else if (user.role === "student") {
    if (courseId) {
      query = query.where(eq(assignments.courseId, parseInt(courseId))) as typeof query;
    }
  }

  if (courseId && user.role !== "student") {
    query = query.where(eq(assignments.courseId, parseInt(courseId))) as typeof query;
  }

  query = query.orderBy(desc(assignments.createdAt)) as typeof query;

  const results = await query;

  return NextResponse.json({ assignments: results });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "lecturer" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { courseId, title, description, deadline, weight } = await request.json();

    if (!courseId || !title || !deadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (user.role === "lecturer" && course.lecturerId !== user.userId) {
      return NextResponse.json({ error: "You can only create assignments for your own courses" }, { status: 403 });
    }

    const [assignment] = await db.insert(assignments).values({
      courseId,
      lecturerId: user.role === "admin" ? course.lecturerId || user.userId : user.userId,
      title,
      description: description || "",
      deadline: new Date(deadline),
      weight: weight || "1.0",
    }).returning();

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error("Create assignment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
