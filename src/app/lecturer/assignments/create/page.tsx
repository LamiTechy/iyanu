"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Navbar from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CreateAssignment() {
  const router = useRouter();
  const { data: courseData } = useSWR("/api/courses", fetcher);
  const [form, setForm] = useState({
    courseId: "", title: "", description: "", deadline: "", weight: "1.0"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const courses = courseData?.courses || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, courseId: parseInt(form.courseId) }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Failed to create"); return; }
      router.push(`/lecturer/assignments/${data.assignment.id}/progress`);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Assignment</h1>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3.5 rounded-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="label">Course</label>
              <select className="input" required value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
                <option value="">Select a course</option>
                {courses.map(({ course }: { course: any }) => (
                  <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Assignment Title</label>
              <input type="text" className="input" placeholder="e.g. Data Structures Project" required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={4} placeholder="Describe the assignment requirements..." value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Deadline</label>
                <input type="date" className="input" required value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div>
                <label className="label">Weight (1.0 - 5.0)</label>
                <input type="number" step="0.1" min="1" max="5" className="input" value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Creating..." : "Create Assignment"}
              </button>
              <button type="button" onClick={() => router.back()} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
