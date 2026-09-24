"use client";

import { useState } from "react";
import useSWR from "swr";
import Navbar from "@/components/Navbar";
import { Download, FileText, Filter } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ReportsPage() {
  const [courseFilter, setCourseFilter] = useState("");
  const { data: reportData, error } = useSWR(
    `/api/reports?courseId=${courseFilter}`,
    fetcher,
    { refreshInterval: 30000 }
  );
  const { data: courseData } = useSWR("/api/courses", fetcher);

  const courses = courseData?.courses || [];
  const report = reportData?.report || [];

  const downloadCSV = () => {
    const params = new URLSearchParams({ format: "csv" });
    if (courseFilter) params.set("courseId", courseFilter);
    window.open(`/api/reports?${params.toString()}`, "_blank");
  };

  if (error) return <div className="p-8 text-center text-red-500">Failed to load report</div>;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-500 mt-1">Assignment submission analytics</p>
          </div>
          <button onClick={downloadCSV} className="btn-outline gap-2">
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-500">FILTER BY COURSE</span>
          </div>
          <select className="input w-full sm:w-80" value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="">All Courses</option>
            {courses.map(({ course }: { course: any }) => (
              <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
            ))}
          </select>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Assignment</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Course</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Deadline</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Students</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Submitted</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Late</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Avg Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {report.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    <FileText size={32} className="mx-auto mb-3 text-gray-200" />
                    <p>No report data available</p>
                  </td></tr>
                ) : (
                  report.map((r: any) => (
                    <tr key={r.assignmentId} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-900">{r.assignmentTitle}</td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{r.courseCode}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{new Date(r.deadline).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-center font-medium">{r.totalStudents}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-green-600 font-semibold">{r.submittedCount}</span>
                        <span className="text-gray-400 text-xs ml-1">/ {r.totalStudents}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={r.lateCount > 0 ? "text-red-600 font-semibold" : "text-gray-400"}>
                          {r.lateCount}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className={`h-full rounded-full ${
                              r.avgProgress >= 80 ? "bg-green-500" :
                              r.avgProgress >= 40 ? "bg-yellow-500" : "bg-red-500"
                            }`} style={{ width: `${r.avgProgress}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-600">{r.avgProgress.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
