"use client";

import Link from "next/link";
import useSWR from "swr";
import Navbar from "@/components/Navbar";
import { Plus, FileText, AlertTriangle, BookOpen, Users, Activity, TrendingUp } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

function StatCard({ icon, label, value, gradient }: { icon: React.ReactNode; label: string; value: string | number; gradient: string }) {
  return (
    <div className="stat-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function LecturerDashboard() {
  const { data: courseData, error: courseError } = useSWR("/api/courses", fetcher);
  const { data: assignData } = useSWR("/api/assignments", fetcher, { refreshInterval: 30000 });
  const { data: alertData } = useSWR("/api/alerts", fetcher, { refreshInterval: 60000 });
  const { data: userData } = useSWR("/api/auth/me", fetcher);

  const courses = courseData?.courses || [];
  const assignments = assignData?.assignments || [];
  const alerts = alertData?.alerts || [];

  const highRiskCount = alerts.filter((a: any) => a.alert?.riskLevel === "high").length;

  if (courseError) return <div className="p-8 text-center text-red-500">Failed to load courses</div>;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lecturer Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back, {userData?.user?.fullName}</p>
          </div>
          <Link href="/lecturer/assignments/create" className="btn-primary gap-2">
            <Plus size={16} /> New Assignment
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <StatCard icon={<FileText size={18} />} label="Assignments" value={assignments.length} gradient="from-blue-500 to-cyan-500" />
          <StatCard icon={<BookOpen size={18} />} label="Courses" value={courses.length} gradient="from-emerald-500 to-teal-500" />
          <StatCard icon={<Activity size={18} />} label="Total Alerts" value={alerts.length} gradient="from-amber-500 to-orange-500" />
          <StatCard icon={<AlertTriangle size={18} />} label="High Risk" value={highRiskCount} gradient="from-red-500 to-rose-500" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-gray-900">Your Courses</h2>
                <p className="text-xs text-gray-400 mt-0.5">{courses.length} course(s) assigned</p>
              </div>
              <BookOpen size={18} className="text-gray-300" />
            </div>
            {courses.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No courses assigned yet</div>
            ) : (
              <div className="space-y-3">
                {courses.map(({ course }: { course: any }) => (
                  <div key={course.id} className="p-4 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {course.code?.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{course.code}</p>
                        <p className="text-xs text-gray-500">{course.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-gray-900">Recent Assignments</h2>
                <p className="text-xs text-gray-400 mt-0.5">Last 5 assignments</p>
              </div>
              <TrendingUp size={18} className="text-gray-300" />
            </div>
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No assignments yet</div>
            ) : (
              <div className="space-y-2">
                {assignments.slice(0, 5).map(({ assignment, course }: { assignment: any; course: any }) => (
                  <Link key={assignment.id} href={`/lecturer/assignments/${assignment.id}/progress`}
                    className="block p-4 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-colors">
                    <p className="font-medium text-sm text-gray-900">{assignment.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{course?.code} &middot; Due {new Date(assignment.deadline).toLocaleDateString()}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
