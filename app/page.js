"use client";
import { useState, useEffect } from 'react';
import Link from "next/link";
import {
  Shield,
  Wrench,
  FileText,
  Clock,
  Lock,
  Database,
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function Home() {
const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
    useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);
    const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tempToken');
    localStorage.removeItem('userForPasswordChange');
    
    // Update state
    setIsLoggedIn(false);
    setUser(null);
    
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      {/* Navigation */}
      <nav className="border-b border-gray-800 backdrop-blur-xl bg-gray-950/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              INFORM
            </span>
          </div>
               <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            {/* Show user info if available */}
            {user && (
              <span className="text-sm font-medium">
                Welcome, {user.name || user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Logout
              {/* <LogOut className="w-4 h-4" /> */}
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Login
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32 text-center overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full mb-8">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-medium">
              Professional Tool Tracking System
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
            Tool Tracker
          </h1>
          <p className="text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Track daily work by tool and module with full history, images, and
            complete control. Built for engineering excellence.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link
              href="/login"
              className="group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-2xl hover:shadow-blue-600/50 text-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
           
          
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Users, label: "Active Users", value: "50+" },
              { icon: Wrench, label: "Tools Tracked", value: "100+" },
              { icon: FileText, label: "Daily Informs", value: "500+" },
              { icon: TrendingUp, label: "Uptime", value: "99.9%" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:scale-105"
              >
                <stat.icon className="w-8 h-8 text-blue-400 mb-3 mx-auto" />
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-950 py-24 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              What is INFORM?
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full mb-8"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg text-gray-300 leading-relaxed">
                INFORM is a centralized daily task logging system designed
                specifically for engineers and administrators in manufacturing
                environments.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                It provides complete visibility into work performed on each tool
                and module, with robust tracking, image support, timestamps, and
                user accountability.
              </p>
              <div className="flex items-start gap-3 p-4 bg-blue-600/10 border border-blue-600/20 rounded-xl">
                <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-blue-400 mb-1">
                    Enterprise-Grade Security
                  </p>
                  <p className="text-sm text-gray-400">
                    Role-based access control ensures data integrity and proper
                    authorization for all operations.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border border-gray-700 shadow-2xl">
              <div className="space-y-4">
                {[
                  { icon: CheckCircle, text: "Real-time tracking" },
                  { icon: CheckCircle, text: "Image paste support" },
                  { icon: CheckCircle, text: "Complete edit history" },
                  { icon: CheckCircle, text: "Admin controls" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full mb-8"></div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to manage and track your tools effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Role-Based Access",
                desc: "Admin and user permissions for complete control and security.",
                gradient: "from-blue-600 to-blue-700",
              },
              {
                icon: Wrench,
                title: "Tool & Module Tracking",
                desc: "LP1–LP3, EFEM, TM, LL1–LL2, PM1–PM3 and custom modules.",
                gradient: "from-purple-600 to-purple-700",
              },
              {
                icon: FileText,
                title: "Rich Inform Logs",
                desc: "Paste images directly inside informs with full formatting support.",
                gradient: "from-indigo-600 to-indigo-700",
              },
              {
                icon: Clock,
                title: "Full Edit History",
                desc: "Track who edited what and when with complete audit trails.",
                gradient: "from-green-600 to-green-700",
              },
              {
                icon: Lock,
                title: "Job Completion Control",
                desc: "Only admins can reopen completed work for data integrity.",
                gradient: "from-red-600 to-red-700",
              },
              {
                icon: Database,
                title: "Secure & Scalable",
                desc: "Built with Next.js and MongoDB for reliability and performance.",
                gradient: "from-orange-600 to-orange-700",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-950 py-24 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full mb-8"></div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Simple, intuitive workflow to get you started in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              { step: "Login", desc: "Secure authentication", icon: "🔐" },
              { step: "Select Tool", desc: "Choose your equipment", icon: "🔧" },
              { step: "Choose Module", desc: "Pick the component", icon: "⚙️" },
              { step: "Add Inform", desc: "Log your work", icon: "📝" },
              { step: "Mark Complete", desc: "Finalize the task", icon: "✅" },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 hover:border-blue-600 transition-all duration-300 hover:scale-105 text-center">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full text-sm font-bold mb-3">
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">
                    {item.step}
                  </h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
                {i < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-12 rounded-3xl shadow-2xl">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join your team in tracking and managing tools efficiently with
              INFORM.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold transition-all duration-200 shadow-xl hover:shadow-2xl text-lg"
            >
              Login Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                INFORM
              </span>
            </div>
            <div className="text-center md:text-right text-gray-500 text-sm">
              <p>INFORM © {new Date().getFullYear()} — Internal Use Only</p>
              <p className="mt-1">Built with Next.js & MongoDB</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}