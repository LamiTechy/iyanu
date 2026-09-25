import { db } from "./index";
import { users, courses, assignments, progress, notifications } from "./schema";
import { hashPassword } from "../lib/auth";

async function seed() {
  console.log("Seeding database...");

  const hashedPassword = await hashPassword("password123");

  const [admin] = await db.insert(users).values({
    fullName: "System Admin",
    email: "admin@mapoly.edu.ng",
    passwordHash: hashedPassword,
    role: "admin",
    department: "Computer Science",
  }).returning();

  const [lecturer1] = await db.insert(users).values({
    fullName: "Dr. Adebayo Ogunleye",
    email: "adebayo.ogunleye@mapoly.edu.ng",
    passwordHash: hashedPassword,
    role: "lecturer",
    staffId: "LEC001",
    department: "Computer Science",
  }).returning();

  const [lecturer2] = await db.insert(users).values({
    fullName: "Mr. Chinedu Okonkwo",
    email: "chinedu.okonkwo@mapoly.edu.ng",
    passwordHash: hashedPassword,
    role: "lecturer",
    staffId: "LEC002",
    department: "Computer Science",
  }).returning();

  const studentData = [
    { fullName: "Olayiwola Ibrahim", email: "ibrahim.olayiwola@mapoly.edu.ng", matricNo: "24/145/0001" },
    { fullName: "Aisha Bello", email: "aisha.bello@mapoly.edu.ng", matricNo: "24/145/0002" },
    { fullName: "Emeka Nwosu", email: "emeka.nwosu@mapoly.edu.ng", matricNo: "24/145/0003" },
    { fullName: "Funmilayo Adeyemi", email: "funmi.adeyemi@mapoly.edu.ng", matricNo: "24/145/0004" },
    { fullName: "Gideon Bassey", email: "gideon.bassey@mapoly.edu.ng", matricNo: "24/145/0005" },
    { fullName: "Hauwa Mohammed", email: "hauwa.mohammed@mapoly.edu.ng", matricNo: "24/145/0006" },
    { fullName: "Ifeanyi Okafor", email: "ifeanyi.okafor@mapoly.edu.ng", matricNo: "24/145/0007" },
    { fullName: "Janet Akpan", email: "janet.akpan@mapoly.edu.ng", matricNo: "24/145/0008" },
  ];

  const insertedStudents = [];
  for (const s of studentData) {
    const [student] = await db.insert(users).values({
      ...s,
      passwordHash: hashedPassword,
      role: "student",
      department: "Computer Science",
      isActive: true,
    }).returning();
    insertedStudents.push(student);
  }

  const [course1] = await db.insert(courses).values({
    code: "COM 401",
    title: "Software Engineering",
    description: "Principles and practices of software development",
    lecturerId: lecturer1.id,
  }).returning();

  const [course2] = await db.insert(courses).values({
    code: "COM 402",
    title: "Database Management Systems",
    description: "Database design, SQL, and administration",
    lecturerId: lecturer1.id,
  }).returning();

  const [course3] = await db.insert(courses).values({
    code: "COM 403",
    title: "Web Technologies",
    description: "Modern web development with HTML, CSS, JavaScript, and frameworks",
    lecturerId: lecturer2.id,
  }).returning();

  const now = new Date();
  const futureDate = (days: number) => new Date(now.getTime() + days * 86400000);

  const [assign1] = await db.insert(assignments).values({
    courseId: course1.id,
    lecturerId: lecturer1.id,
    title: "Software Requirements Specification",
    description: "Write a comprehensive SRS document for a library management system. Include functional and non-functional requirements, use case diagrams, and data flow diagrams.",
    deadline: futureDate(14),
    weight: "2.0",
  }).returning();

  const [assign2] = await db.insert(assignments).values({
    courseId: course1.id,
    lecturerId: lecturer1.id,
    title: "UML Design Project",
    description: "Create UML diagrams (class, sequence, activity, state) for an e-commerce platform. Submit as PDF.",
    deadline: futureDate(21),
    weight: "1.5",
  }).returning();

  const [assign3] = await db.insert(assignments).values({
    courseId: course2.id,
    lecturerId: lecturer1.id,
    title: "SQL Query Optimization",
    description: "Given a sample database, write optimized SQL queries. Analyze and compare execution plans.",
    deadline: futureDate(7),
    weight: "1.0",
  }).returning();

  const [assign4] = await db.insert(assignments).values({
    courseId: course3.id,
    lecturerId: lecturer2.id,
    title: "Responsive Portfolio Website",
    description: "Build a personal portfolio website using HTML, CSS, and JavaScript. Must be fully responsive and mobile-friendly.",
    deadline: futureDate(10),
    weight: "3.0",
  }).returning();

  const [assign5] = await db.insert(assignments).values({
    courseId: course3.id,
    lecturerId: lecturer2.id,
    title: "React Todo Application",
    description: "Build a todo application using React with features: add, delete, edit, mark complete, and local storage persistence.",
    deadline: futureDate(5),
    weight: "2.5",
  }).returning();

  for (let i = 0; i < insertedStudents.length; i++) {
    const student = insertedStudents[i];
    const rng = (offset: number) => (i + offset) % 100;

    await db.insert(progress).values({
      assignmentId: assign1.id,
      studentId: student.id,
      status: rng(1) < 70 ? "in_progress" : "not_started",
      percentComplete: Math.min(rng(2), 60),
      lastUpdated: futureDate(-rng(3) % 5),
    });

    await db.insert(progress).values({
      assignmentId: assign2.id,
      studentId: student.id,
      status: rng(4) < 50 ? "in_progress" : "not_started",
      percentComplete: Math.min(rng(5), 30),
      lastUpdated: futureDate(-rng(6) % 3),
    });

    await db.insert(progress).values({
      assignmentId: assign3.id,
      studentId: student.id,
      status: rng(7) < 60 ? "in_progress" : rng(8) < 30 ? "submitted" : "not_started",
      percentComplete: rng(9) < 20 ? 100 : Math.min(rng(10), 70),
      lastUpdated: futureDate(-rng(11) % 7),
    });

    await db.insert(progress).values({
      assignmentId: assign4.id,
      studentId: student.id,
      status: rng(12) < 80 ? "in_progress" : "not_started",
      percentComplete: Math.min(rng(13), 50),
      lastUpdated: futureDate(-rng(14) % 4),
    });

    await db.insert(progress).values({
      assignmentId: assign5.id,
      studentId: student.id,
      status: "not_started",
      percentComplete: 0,
      lastUpdated: now,
    });
  }

  await db.insert(notifications).values({
    userId: insertedStudents[0].id,
    assignmentId: assign5.id,
    message: `URGENT: You are at high risk of missing the deadline for "${assign5.title}" (due ${new Date(assign5.deadline).toLocaleDateString()}). Please submit immediately!`,
    type: "alert",
  });

  await db.insert(notifications).values({
    userId: insertedStudents[1].id,
    assignmentId: assign3.id,
    message: `Reminder: "${assign3.title}" is due in 7 days. Current progress: 30%.`,
    type: "reminder",
  });

  await db.insert(notifications).values({
    userId: insertedStudents[2].id,
    assignmentId: assign4.id,
    message: `Deadline approaching: "${assign4.title}" due on ${new Date(assign4.deadline).toLocaleDateString()}.`,
    type: "deadline",
  });

  console.log("Seed complete!");
  console.log(`  - ${[admin, lecturer1, lecturer2, ...insertedStudents].length} users`);
  console.log(`  - 3 courses`);
  console.log(`  - 5 assignments`);
  console.log(`  - ${insertedStudents.length * 5} progress records`);
  console.log(`  - 3 notifications`);
  console.log("\nLogin credentials (all users): password123");
  console.log("Admin: admin@mapoly.edu.ng");
  console.log("Lecturer 1: adebayo.ogunleye@mapoly.edu.ng");
  console.log("Lecturer 2: chinedu.okonkwo@mapoly.edu.ng");
  console.log("Student 1: ibrahim.olayiwola@mapoly.edu.ng");
}

seed().catch(console.error);
