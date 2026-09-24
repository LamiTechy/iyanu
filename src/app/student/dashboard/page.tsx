"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import Navbar from "@/components/Navbar";
import { BookOpen, Clock, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

function RiskBadge({ level }: { level: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    low: { bg: "bg-green-50", text: "text-green-600", icon: <CheckCircle2 size={12} /> },
    medium: { bg: "bg-yellow-50", text: "text-yellow-600", icon: <AlertTriangle size={12} /> },
    high: { bg: "bg-red-50", text: "text-red-600", icon: <AlertTriangle size={12} /> },
  };
  const c = config[level] || config.low;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
      {c.icon}
      {level === "high" ? "High Risk" : level === "medium" ? "At Risk" : "On Track"}
    </span>
  );
}

export default function StudentDashboard() {
  const [filter, setFilter] = useState("all");
  const { data, error, isLoading } = useSWR("/api/assignments", fetcher, { refreshInterval: 30000 });
  const { data: alertData } = useSWR("/api/alerts", fetcher, { refreshInterval: 60000 });
  const { data: userData } = useSWR("/api/auth/me", fetcher);

  const assignments = data?.assignments || [];
  const alerts = alertData?.alerts || [];

  const getAlert = (assignmentId: number) =>
    alerts.find((a: { alert: { assignmentId: number } }) => a.alert?.assignmentId === assignmentId);

  const filtered = filter === "all" ? assignments : assignments.filter((a: any) => {
    const alert = getAlert(a.assignment.id);
    return alert?.alert?.riskLevel === filter;
  });

  if (error) return <div className="p-8 text-center text-red-500">Failed to load data</div>;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome, {userData?.user?.fullName}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {["all", "low", "medium", "high"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm rounded-xl font-medium transition-all ${
                filter === f
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} {f !== "all" && "Risk"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-gray-500 font-medium">No assignments found</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for new assignments</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map(({ assignment, course }: { assignment: any; course: any }) => {
              const alert = getAlert(assignment.id);
              const riskLevel = alert?.alert?.riskLevel || "low";
              const daysLeft = Math.ceil((new Date(assignment.deadline).getTime() - Date.now()) / 86400000);

              const borderColor = riskLevel === "high" ? "border-l-red-500"
                : riskLevel === "medium" ? "border-l-yellow-500" : "border-l-green-500";

              return (
                <Link key={assignment.id} href={`/student/assignments/${assignment.id}`}
                  className={`card p-6 border-l-4 ${borderColor} hover:-translate-y-0.5 transition-all duration-200`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{course?.code} - {course?.title}</p>
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                          daysLeft <= 0 ? "text-red-600" : daysLeft <= 2 ? "text-orange-600" : "text-gray-500"
                        }`}>
                          <Clock size={12} />
                          {daysLeft <= 0 ? "Overdue!" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
                        </span>
                        <RiskBadge level={riskLevel} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold text-blue-600">{alert?.alert?.riskScore || 0}%</div>
                      <p className="text-xs text-gray-400 mt-0.5">Risk Score</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
