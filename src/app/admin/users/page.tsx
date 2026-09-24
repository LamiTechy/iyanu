"use client";

import { useState } from "react";
import useSWR from "swr";
import Navbar from "@/components/Navbar";
import { Check, X, Search, Users as UsersIcon } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminUsers() {
  const { data, error, mutate } = useSWR("/api/admin/users", fetcher, { refreshInterval: 15000 });
  const [search, setSearch] = useState("");

  const toggleActive = async (userId: number, current: boolean) => {
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isActive: !current }),
    });
    mutate();
  };

  if (error) return <div className="p-8 text-center text-red-500">Failed to load users</div>;

  const users = (data?.users || []).filter((u: any) =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">{data?.users?.length || 0} total users</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search users..." className="input pl-10"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">ID</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Active</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    <UsersIcon size={32} className="mx-auto mb-3 text-gray-200" />
                    <p>No users found</p>
                  </td></tr>
                ) : (
                  users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {user.fullName?.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{user.email}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          user.role === "admin" ? "bg-purple-50 text-purple-600" :
                          user.role === "lecturer" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                        }`}>{user.role}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 font-mono text-xs">{user.matricNo || user.staffId || "-"}</td>
                      <td className="px-5 py-4 text-center">
                        {user.isActive
                          ? <div className="inline-flex items-center gap-1.5 text-green-600 text-xs font-medium"><Check size={14} /> Active</div>
                          : <div className="inline-flex items-center gap-1.5 text-red-600 text-xs font-medium"><X size={14} /> Inactive</div>
                        }
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button onClick={() => toggleActive(user.id, user.isActive)}
                          className={`text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all ${
                            user.isActive
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}>
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
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
