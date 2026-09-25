"use client";

import { useState } from "react";
import useSWR from "swr";
import Navbar from "@/components/Navbar";
import { Plus, BookOpen, Trash2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminCourses() {
  const { data, error, mutate } = useSWR("/api/admin/courses", fetcher);
  const { data: userData } = useSWR("/api/admin/users", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", title: "", description: "", lecturerId: "" });
  const [loading, setLoading] = useState(false);

  const courses = data?.courses || [];
  const lecturers = userData?.users?.filter((u: any) => u.role === "lecturer") || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, lecturerId: form.lecturerId ? parseInt(form.lecturerId) : null }),
    });
    mutate();
    setShowForm(false);
    setForm({ code: "", title: "", description: "", lecturerId: "" });
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this course?")) return;
    await fetch("/api/admin/courses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    mutate();
  };

  if (error) return <div className="p-8 text-center text-red-500">Failed to load courses</div>;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
            <p className="text-sm text-gray-500 mt-1">{courses.length} course(s)</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary gap-2">
            <Plus size={16} /> Add Course
          </button>
        </div>

        {showForm && (
          <div className="card p-6 mb-6 slide-up">
            <h3 className="font-semibold text-gray-900 mb-4">New Course</h3>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Course Code</label>
                <input type="text" className="input" placeholder="e.g. COM101" required value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div>
                <label className="label">Title</label>
                <input type="text" className="input" placeholder="e.g. Introduction to Programming" required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="label">Lecturer</label>
                <select className="input" value={form.lecturerId}
                  onChange={(e) => setForm({ ...form, lecturerId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {lecturers.map((l: any) => (
                    <option key={l.id} value={l.id}>{l.fullName} ({l.staffId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <input type="text" className="input" placeholder="Optional description" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-primary">{loading ? "Saving..." : "Create Course"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Code</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Title</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Lecturer</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courses.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400">
                    <BookOpen size={32} className="mx-auto mb-3 text-gray-200" />
                    <p>No courses found</p>
                  </td></tr>
                ) : (
                  courses.map((course: any) => {
                    const lecturer = lecturers.find((l: any) => l.id === course.lecturerId);
                    return (
                      <tr key={course.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{course.code}</span>
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-900">{course.title}</td>
                        <td className="px-5 py-4 text-gray-500">{lecturer?.fullName || <span className="text-gray-300 italic">Unassigned</span>}</td>
                        <td className="px-5 py-4 text-center">
                          <button onClick={() => handleDelete(course.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-all inline-flex items-center gap-1.5 text-xs font-medium">
                            <Trash2 size={14} /> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
