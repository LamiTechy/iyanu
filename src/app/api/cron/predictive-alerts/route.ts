import { NextResponse } from "next/server";
import { db } from "@/db";
import { assignments, progress, alerts, notifications, users, courses } from "@/db/schema";
import { eq, and, lt, gte, sql, or } from "drizzle-orm";

function calculateRiskScore(
  daysUntilDeadline: number,
  totalDaysGiven: number,
  percentComplete: number,
  weight: number,
  historicalOnTimeRate: number
): { score: number; level: "low" | "medium" | "high" } {
  if (daysUntilDeadline <= 0) {
    return { score: 100, level: "high" };
  }

  const timeRatio = daysUntilDeadline / Math.max(totalDaysGiven, 1);
  const progressRatio = percentComplete / 100;
  const expectedProgress = 1 - timeRatio;

  const progressGap = expectedProgress - progressRatio;

  let score = 0;
  if (progressGap > 0.3) score += 40;
  else if (progressGap > 0.1) score += 20;

  if (timeRatio < 0.2) score += 30;
  else if (timeRatio < 0.4) score += 15;

  score += (1 - historicalOnTimeRate) * 20;

  score += (weight - 1) * 10;

  score = Math.min(100, Math.max(0, score));

  let level: "low" | "medium" | "high";
  if (score >= 60) level = "high";
  else if (score >= 30) level = "medium";
  else level = "low";

  return { score, level };
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const activeAssignments = await db.select().from(assignments)
      .where(gte(assignments.deadline, sql`NOW() - INTERVAL '7 days'`));

    let alertsGenerated = 0;

    for (const assignment of activeAssignments) {
      const students = await db.select().from(users).where(
        and(eq(users.role, "student"), eq(users.isActive, true))
      );

      const totalDaysGiven = Math.ceil(
        (new Date(assignment.deadline).getTime() - new Date(assignment.createdAt).getTime()) / 86400000
      );

      for (const student of students) {
        const [existingProgress] = await db.select().from(progress)
          .where(and(eq(progress.assignmentId, assignment.id), eq(progress.studentId, student.id)))
          .limit(1);

        const percentComplete = existingProgress?.percentComplete || 0;
        const daysUntilDeadline = Math.ceil(
          (new Date(assignment.deadline).getTime() - now.getTime()) / 86400000
        );

        const [pastSubmissions] = await db.select({
          total: sql<number>`COUNT(*)`,
          onTime: sql<number>`SUM(CASE WHEN is_late = false THEN 1 ELSE 0 END)`,
        }).from(sql`submissions`)
          .where(and(
            eq(sql`student_id`, student.id),
            lt(sql`submitted_at`, now)
          ));

        const totalPast = Number(pastSubmissions?.total || 0);
        const onTimePast = Number(pastSubmissions?.onTime || 0);
        const historicalOnTimeRate = totalPast > 0 ? onTimePast / totalPast : 0.8;

        const { score, level } = calculateRiskScore(
          daysUntilDeadline,
          Math.max(totalDaysGiven, 1),
          percentComplete,
          parseFloat(assignment.weight) || 1,
          historicalOnTimeRate
        );

        const predictedOutcome = level === "high"
          ? "Likely to miss deadline"
          : level === "medium"
          ? "At risk of late submission"
          : "On track for on-time submission";

        await db.insert(alerts).values({
          assignmentId: assignment.id,
          studentId: student.id,
          riskLevel: level,
          predictedOutcome,
          riskScore: String(score),
          generatedAt: now,
        });

        if (level === "high" || level === "medium") {
          await db.insert(notifications).values({
            userId: student.id,
            assignmentId: assignment.id,
            message: level === "high"
              ? `URGENT: You are at high risk of missing the deadline for "${assignment.title}" (due ${new Date(assignment.deadline).toLocaleDateString()}). Please submit immediately!`
              : `Reminder: You are falling behind on "${assignment.title}". Only ${daysUntilDeadline} days left. Current progress: ${percentComplete}%.`,
            type: level === "high" ? "alert" : "reminder",
            sentAt: now,
          });
        }

        alertsGenerated++;
      }
    }

    return NextResponse.json({
      success: true,
      alertsGenerated,
      message: `Generated ${alertsGenerated} alert predictions`,
    });
  } catch (error) {
    console.error("Predictive alert error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
