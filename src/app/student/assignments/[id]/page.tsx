"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Clock, FileUp, RefreshCw, BookOpen, Upload } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function StudentAssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR(`/api/assignments/${id}`, fetcher, { refreshInterval: 15000 });
  const { data: userData } = useSWR("/api/auth/me", fetcher);
  const [updating, setUpdating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState("not_started");

  useEffect(() => {
    if (data?.studentProgress) {
      setProgressPercent(data.studentProgress.percentComplete);
      setProgressStatus(data.studentProgress.status);
    }
  }, [data]);

  if (error) return <div className="p-8 text-center text-red-500">Failed to load</div>;
  if (isLoading) return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card p-8 animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-20 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
  if (!data) return <div className="p-8 text-center text-gray-500">Assignment not found</div>;

  const assignment = data.assignment;
  const course = data.course;
  const studentProgress = data.studentProgress;
  const daysLeft = Math.ceil((new Date(assignment.deadline).getTime() - Date.now()) / 86400000);

  const handleProgressUpdate = async () => {
    setUpdating(true);
    await fetch(`/api/progress/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: progressStatus, percentComplete: progressPercent }),
    });
    mutate();
    setUpdating(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("assignmentId", id);

    await fetch("/api/submissions", { method: "POST", body: formData });
    mutate();
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="card p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <BookOpen size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{assignment.title}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{course?.code} - {course?.title}</p>
            </div>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed mb-5">{assignment.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium ${
              daysLeft <= 0 ? "bg-red-50 text-red-600" : daysLeft <= 2 ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-600"
            }`}>
              <Clock size={14} />
              {daysLeft <= 0 ? "Overdue" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
            </div>
            <div className="text-gray-500">
              Deadline: {new Date(assignment.deadline).toLocaleDateString()}
            </div>
            <div className="text-gray-500">
              Weight: {assignment.weight}
            </div>
          </div>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <RefreshCw size={16} className="text-blue-500" /> Update Progress
          </h2>

          <div className="space-y-5">
            <div>
              <label className="label">Status</label>
              <select className="input w-full sm:w-64" value={progressStatus}
                onChange={(e) => setProgressStatus(e.target.value)}>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted">Submitted</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Progress</label>
                <span className="text-sm font-bold text-blue-600">{progressPercent}%</span>
              </div>
              <input type="range" min="0" max="100" step="5" value={progressPercent}
                onChange={(e) => setProgressPercent(parseInt(e.target.value))}
                className="w-full accent-blue-600 h-2 rounded-full cursor-pointer" />
              <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <button onClick={handleProgressUpdate} disabled={updating} className="btn-primary">
              {updating ? "Saving..." : "Update Progress"}
            </button>

            {studentProgress && (
              <p className="text-xs text-gray-400 mt-1">
                Last updated: {new Date(studentProgress.lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Upload size={16} className="text-blue-500" /> Submit Assignment
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors">
              <FileUp size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500 mb-1">Drag & drop your file here, or click to browse</p>
              <p className="text-xs text-gray-400">Supported: PDF, DOC, ZIP, Images</p>
              <input type="file" name="file" required
                className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition-colors cursor-pointer" />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Uploading..." : "Submit Assignment"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
