import { pgTable, serial, varchar, text, integer, timestamp, decimal, boolean, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["student", "lecturer", "admin"]);
export const progressStatusEnum = pgEnum("progress_status", ["not_started", "in_progress", "submitted"]);
export const riskLevelEnum = pgEnum("risk_level", ["low", "medium", "high"]);
export const notificationTypeEnum = pgEnum("notification_type", ["reminder", "alert", "deadline"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("student"),
  matricNo: varchar("matric_no", { length: 50 }),
  staffId: varchar("staff_id", { length: 50 }),
  department: varchar("department", { length: 255 }).notNull().default("Computer Science"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  lecturerId: integer("lecturer_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  lecturerId: integer("lecturer_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  deadline: timestamp("deadline").notNull(),
  weight: decimal("weight", { precision: 3, scale: 1 }).notNull().default("1.0"),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull().references(() => assignments.id),
  studentId: integer("student_id").notNull().references(() => users.id),
  status: progressStatusEnum("status").notNull().default("not_started"),
  percentComplete: integer("percent_complete").notNull().default(0),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull().references(() => assignments.id),
  studentId: integer("student_id").notNull().references(() => users.id),
  riskLevel: riskLevelEnum("risk_level").notNull().default("low"),
  predictedOutcome: text("predicted_outcome"),
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  assignmentId: integer("assignment_id").references(() => assignments.id),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").notNull().default("reminder"),
  isRead: boolean("is_read").notNull().default(false),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subscription: text("subscription").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull().references(() => assignments.id),
  studentId: integer("student_id").notNull().references(() => users.id),
  fileUrl: text("file_url").notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  isLate: boolean("is_late").notNull().default(false),
});
