"use client";

import Link from "next/link";
import { GraduationCap, ClipboardCheck, BarChart3, Bell, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/school.jpeg" alt="MAPOLY" className="w-8 h-8 object-contain rounded-md" />
              <span className="text-lg font-bold gradient-text">MAPOLY</span>
            </Link>
            <div className="flex items-center gap-3">
              <img src="/dept.jpeg" alt="CS Dept" className="w-8 h-8 object-contain rounded-md" />
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-4 tracking-tight">
                Moshood Abiola Polytechnic
              </h1>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-8 text-sm text-blue-100">
                <Zap size={14} />
                <span>Computer Science Department</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
                Assignment Progression Tracker
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                  with Predictive Alert
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Track assignments, monitor progress, and receive intelligent alerts
                powered by predictive analytics.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register" className="bg-white text-blue-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5">
                  Get Started Free
                </Link>
                <Link href="/login" className="border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-all backdrop-blur-sm">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              {[
                { value: "1K+", label: "Students" },
                { value: "50+", label: "Courses" },
                { value: "95%", label: "On-Time Rate" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-blue-200 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f0f4f8] to-transparent" />
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to stay on track
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              A complete platform for students and lecturers to manage, track, and predict assignment outcomes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <ClipboardCheck size={24} />,
                title: "For Students",
                desc: "View assignments, update progress, submit work, and get predictive alerts to stay on top of deadlines.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: <BarChart3 size={24} />,
                title: "For Lecturers",
                desc: "Create assignments, monitor student progress in real-time, and generate comprehensive reports.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: <Shield size={24} />,
                title: "Predictive Engine",
                desc: "AI-driven risk analysis identifies students at risk of late submission before deadlines pass.",
                gradient: "from-amber-500 to-orange-500",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform`} />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/school.jpeg" alt="MAPOLY" className="w-7 h-7 object-contain rounded-md" />
              <span className="text-white font-semibold">MAPOLY</span>
            </div>
            <p className="text-sm">&copy; 2026 Computer Science Department, Moshood Abiola Polytechnic.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
