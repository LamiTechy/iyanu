"use client";

import useSWR from "swr";
import Navbar from "@/components/Navbar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, BookOpen, AlertTriangle, GraduationCap, TrendingUp, Activity } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

const COLORS = ["#dc2626", "#ca8a04", "#16a34a"];

function StatCard({ icon, label, value, gradient, children }: { icon: React.ReactNode; label: string; value: string | number; gradient: string; children?: React.ReactNode }) {
  return (
    <div className="stat-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        {children}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: userData } = useSWR("/api/admin/users", fetcher);
  const { data: courseData } = useSWR("/api/admin/courses", fetcher);
  const { data: assignData } = useSWR("/api/assignments", fetcher);
  const { data: alertData } = useSWR("/api/alerts", fetcher, { refreshInterval: 30000 });

  const users = userData?.users || [];
  const courses = courseData?.courses || [];
  const assignments = assignData?.assignments || [];
  const alerts = alertData?.alerts || [];

  const students = users.filter((u: any) => u.role === "student");
  const lecturers = users.filter((u: any) => u.role === "lecturer");
  const highRiskAlerts = alerts.filter((a: any) => a.riskLevel === "high");

  const roleData = [
    { name: "Students", value: students.length },
    { name: "Lecturers", value: lecturers.length },
    { name: "Admins", value: users.filter((u: any) => u.role === "admin").length },
  ];

  const riskData = [
    { name: "High", value: alerts.filter((a: any) => a.riskLevel === "high").length },
    { name: "Medium", value: alerts.filter((a: any) => a.riskLevel === "medium").length },
    { name: "Low", value: alerts.filter((a: any) => a.riskLevel === "low").length },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl p-3 shadow-lg text-sm">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-gray-600">{payload[0].value} alerts</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Overview of your platform</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
            <Activity size={14} />
            Live
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <StatCard icon={<Users size={18} />} label="Total Students" value={students.length} gradient="from-blue-500 to-cyan-500" />
          <StatCard icon={<GraduationCap size={18} />} label="Total Lecturers" value={lecturers.length} gradient="from-emerald-500 to-teal-500" />
          <StatCard icon={<BookOpen size={18} />} label="Active Courses" value={courses.length} gradient="from-purple-500 to-pink-500" />
          <StatCard icon={<AlertTriangle size={18} />} label="High Risk Alerts" value={highRiskAlerts.length} gradient="from-red-500 to-rose-500">
            {highRiskAlerts.length > 0 && (
              <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-medium">Needs attention</span>
            )}
          </StatCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-1">User Distribution</h2>
            <p className="text-xs text-gray-400 mb-5">Breakdown by role</p>
            {users.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">No user data</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {roleData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Risk Level Distribution</h2>
            <p className="text-xs text-gray-400 mb-5">Alert severity breakdown</p>
            {alerts.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">No alerts generated yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={riskData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {riskData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">Recent Alerts</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest {Math.min(alerts.length, 10)} alert(s)</p>
            </div>
            <TrendingUp size={18} className="text-gray-300" />
          </div>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No alerts yet</div>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 10).map((alert: any) => (
                <div key={alert.id} className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.riskLevel === "high" ? "bg-red-500" :
                      alert.riskLevel === "medium" ? "bg-yellow-500" : "bg-green-500"
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{alert.predictedOutcome}</p>
                      <p className="text-xs text-gray-400">{new Date(alert.generatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    alert.riskLevel === "high" ? "bg-red-50 text-red-600" :
                    alert.riskLevel === "medium" ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-green-600"
                  }`}>{alert.riskLevel}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
