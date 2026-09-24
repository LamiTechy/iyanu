"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Users, CheckCircle2, Clock, BarChart3, ExternalLink } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AssignmentProgress() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: assignData, error: assignError } = useSWR(`/api/assignments/${id}`, fetcher);
  const { data: progressData, error: progressError } = useSWR(`/api/progress/${id}`, fetcher, { refreshInterval: 15000 });

  if (assignError || progressError) return <div className="p-8 text-center text-red-500">Failed to load data</div>;

  const assignment = assignData?.assignment;
  const course = assignData?.course;
  const progressList = progressData?.progressList || [];

  const submitted = progressList.filter((p: any) => p.progress.status === "submitted").length;
  const inProgress = progressList.filter((p: any) => p.progress.status === "in_progress").length;
  const notStarted = progressList.filter((p: any) => p.progress.status === "not_started").length;
  const avgProgress = progressList.length > 0
    ? Math.round(progressList.reduce((sum: number, p: any) => sum + p.progress.percentComplete, 0) / progressList.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        {assignment && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{course?.code} - {course?.title} &middot; Due {new Date(assignment.deadline).toLocaleDateString()}</p>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="stat-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                <Users size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{progressList.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Students</p>
          </div>
          <div className="stat-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{submitted}</p>
            <p className="text-xs text-gray-500 mt-0.5">Submitted</p>
          </div>
          <div className="stat-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <Clock size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{inProgress}</p>
            <p className="text-xs text-gray-500 mt-0.5">In Progress</p>
          </div>
          <div className="stat-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <BarChart3 size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{avgProgress}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Avg Progress</p>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Student Progress</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Student</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Matric No</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Progress</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Submission</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {progressList.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No progress data yet</td></tr>
                ) : (
                  progressList.map(({ progress: prog, student, submission }: { progress: any; student: any; submission: any }) => (
                    <tr key={prog.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {student?.fullName?.charAt(0) || "?"}
                          </div>
                          <span className="font-medium text-gray-900">{student?.fullName || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{student?.matricNo || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          prog.status === "submitted" ? "bg-green-50 text-green-600" :
                          prog.status === "in_progress" ? "bg-yellow-50 text-yellow-600" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {prog.status.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-28 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${
                              prog.percentComplete >= 80 ? "bg-gradient-to-r from-green-400 to-green-500" :
                              prog.percentComplete >= 40 ? "bg-gradient-to-r from-yellow-400 to-yellow-500" : "bg-gradient-to-r from-red-400 to-red-500"
                            }`} style={{ width: `${prog.percentComplete}%` }}></div>
                          </div>
                          <span className="text-xs font-medium text-gray-600">{prog.percentComplete}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {submission?.fileUrl ? (
                          <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors">
                            <ExternalLink size={12} /> View
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300">No file</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(prog.lastUpdated).toLocaleString()}
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
