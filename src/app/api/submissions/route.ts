import { NextResponse } from "next/server";
import { db } from "@/db";
import { submissions, assignments, progress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "student") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const assignmentId = parseInt(formData.get("assignmentId") as string);

    if (!file || !assignmentId) {
      return NextResponse.json({ error: "File and assignmentId required" }, { status: 400 });
    }

    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, assignmentId)).limit(1);
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    let fileUrl = "";
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`submissions/${user.userId}/${assignmentId}_${file.name}`, file, { access: "public" });
      fileUrl = blob.url;
    } else {
      fileUrl = `https://placeholder.blob.vercel-storage.com/submissions/${user.userId}/${assignmentId}_${file.name}`;
    }

    const isLate = new Date() > new Date(assignment.deadline);

    const [submission] = await db.insert(submissions).values({
      assignmentId,
      studentId: user.userId,
      fileUrl,
      submittedAt: new Date(),
      isLate,
    }).returning();

    await db.update(progress)
      .set({ status: "submitted", percentComplete: 100, lastUpdated: new Date() })
      .where(and(eq(progress.assignmentId, assignmentId), eq(progress.studentId, user.userId)));

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
