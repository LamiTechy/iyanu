import { NextResponse } from "next/server";
import { db } from "@/db";
import { assignments, courses, progress, users, submissions } from "@/db/schema";
import { eq, and, sql, count } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "lecturer" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  const format = searchParams.get("format") || "json";

  let conditions = [];
  if (user.role === "lecturer") {
    conditions.push(eq(courses.lecturerId, user.userId));
  }
  if (courseId) {
    conditions.push(eq(assignments.courseId, parseInt(courseId)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db.select({
    assignmentId: assignments.id,
    assignmentTitle: assignments.title,
    courseCode: courses.code,
    courseTitle: courses.title,
    deadline: assignments.deadline,
    totalStudents: sql<number>`(SELECT COUNT(*) FROM ${users} WHERE ${users.role} = 'student')`,
    submittedCount: sql<number>`(SELECT COUNT(*) FROM ${progress} WHERE ${progress.assignmentId} = ${assignments.id} AND ${progress.status} = 'submitted')`,
    lateCount: sql<number>`(SELECT COUNT(*) FROM ${submissions} WHERE ${submissions.assignmentId} = ${assignments.id} AND ${submissions.isLate} = true)`,
    avgProgress: sql<number>`COALESCE((SELECT AVG(${progress.percentComplete}) FROM ${progress} WHERE ${progress.assignmentId} = ${assignments.id}), 0)`,
  }).from(assignments)
    .leftJoin(courses, eq(assignments.courseId, courses.id))
    .where(whereClause);

  if (format === "csv") {
    const header = "Assignment,Course,Deadline,Total Students,Submitted,Late,Avg Progress\n";
    const rows = result.map(r =>
      `"${r.assignmentTitle}","${r.courseCode} ${r.courseTitle}","${r.deadline}",${r.totalStudents},${r.submittedCount},${r.lateCount},${r.avgProgress.toFixed(1)}%`
    ).join("\n");
    return new NextResponse(header + rows, {
      headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=report.csv" },
    });
  }

  return NextResponse.json({ report: result });
}
