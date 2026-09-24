import { NextResponse } from "next/server";
import { db } from "@/db";
import { courses, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let query = db.select({
    course: courses,
    lecturer: { id: users.id, fullName: users.fullName, staffId: users.staffId },
  }).from(courses)
    .leftJoin(users, eq(courses.lecturerId, users.id));

  if (user.role === "lecturer") {
    query = query.where(eq(courses.lecturerId, user.userId)) as typeof query;
  }

  const results = await query;
  return NextResponse.json({ courses: results });
}
