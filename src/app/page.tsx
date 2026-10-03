"use client";

import Link from "next/link";
import { ClipboardCheck, BarChart3, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white h-16 md:h-[72px] border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-full">
          <div className="flex items-center justify-end h-full gap-3 md:gap-5">
            <Link href="/login" className="inline-flex items-center gap-2 text-[#0d4fc4] hover:text-[#0b3ea4] transition-colors font-medium text-sm md:text-base">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Sign In</span>
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-[#0d6ae1] text-white px-5 py-2.5 text-sm md:text-base font-semibold shadow-[0_6px_16px_rgba(13,106,225,0.25)] hover:bg-[#0b5ed7] transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d65d8] via-[#1a5dd5] to-[#4f59e8]">
          <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3 md:gap-4 text-white">
                <img src="/school.jpeg" alt="MAPOLY" className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-full bg-white p-1.5 shadow-lg" />
                <span aria-hidden className="w-px h-8 md:h-10 bg-white/40" />
                <div>
                  <div className="text-sm md:text-base font-bold tracking-tight leading-tight uppercase">
                    Moshood Abiola
                  </div>
                  <div className="text-sm md:text-base font-bold tracking-tight leading-tight uppercase">
                    Polytechnic
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-4 text-white">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white p-1.5 shadow-lg flex items-center justify-center">
                  <img src="/dept.jpeg" alt="Computer Science Department" className="w-full h-full object-cover rounded-full" />
                </div>
                <span aria-hidden className="w-px h-8 md:h-10 bg-white/40" />
                <div className="text-right uppercase text-white/95">
                  <div className="text-sm md:text-base font-bold tracking-tight leading-tight">
                    Computer Science
                  </div>
                  <div className="text-sm md:text-base font-bold tracking-tight leading-tight">
                    Department
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-6 md:pt-10 pb-12 md:pb-16 text-white">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1] mb-5 md:mb-6">
                Moshood Abiola
                <span className="block">Polytechnic</span>
              </h1>

              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs md:text-sm font-medium text-white/90 backdrop-blur-sm shadow-inner shadow-white/5 mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                  <path d="M4 13.5V7.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6" />
                  <path d="M2 15.5h20" />
                  <path d="M7 15.5v3m10-3v3" />
                </svg>
                <span>Computer Science Department</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight mb-2">
                Assignment Progression Tracker
              </h2>
              <p className="text-base md:text-lg font-medium text-blue-100 mb-5">
                with Predictive Alert
              </p>

              <p className="text-sm md:text-base text-blue-100/90 max-w-xl mx-auto leading-relaxed">
                Track assignments, monitor progress, and receive intelligent alerts
                powered by predictive analytics.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Everything you need to stay on track
            </h2>
            <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto">
              A complete platform for students and lecturers to manage, track, and predict assignment outcomes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {[
              {
                icon: <ClipboardCheck size={20} />,
                title: "For Students",
                desc: "View assignments, update progress, submit work, and get predictive alerts to stay on top of deadlines.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: <BarChart3 size={20} />,
                title: "For Lecturers",
                desc: "Create assignments, monitor student progress in real-time, and generate comprehensive reports.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: <Shield size={20} />,
                title: "Predictive Engine",
                desc: "AI-driven risk analysis identifies students at risk of late submission before deadlines pass.",
                gradient: "from-amber-500 to-orange-500",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform`} />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8">
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
