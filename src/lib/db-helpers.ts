import { db } from "@/db";
import { users, courses, assignments, progress, alerts, notifications, submissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getStudentById(studentId: number) {
  return db.select().from(users).where(and(eq(users.id, studentId), eq(users.role, "student"))).limit(1).then(r => r[0]);
}

export async function getLecturerById(lecturerId: number) {
  return db.select().from(users).where(and(eq(users.id, lecturerId), eq(users.role, "lecturer"))).limit(1).then(r => r[0]);
}

export async function getLecturerCourses(lecturerId: number) {
  return db.select().from(courses).where(eq(courses.lecturerId, lecturerId));
}

export async function getCourseAssignments(courseId: number) {
  return db.select().from(assignments).where(eq(assignments.courseId, courseId));
}

export async function getStudentProgress(studentId: number, assignmentId: number) {
  return db.select().from(progress).where(
    and(eq(progress.studentId, studentId), eq(progress.assignmentId, assignmentId))
  ).limit(1).then(r => r[0]);
}

export async function getAssignmentWithCourse(assignmentId: number) {
  const result = await db.select({
    assignment: assignments,
    course: courses,
  })
  .from(assignments)
  .leftJoin(courses, eq(assignments.courseId, courses.id))
  .where(eq(assignments.id, assignmentId))
  .limit(1);

  return result[0];
}

export { db, users, courses, assignments, progress, alerts, notifications, submissions, eq, and };
