"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import {
  LayoutDashboard,
  Users,
  Wrench,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");


    useEffect(() => {
      
      const token = localStorage.getItem("token");
      try {
      const decodedPayload = jwtDecode(token);
      // console.log(decodedPayload);
      setAdminEmail(decodedPayload.emal)
      setAdminName(decodedPayload.name)
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
    }, []);


  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Tools", href: "/admin/tools", icon: Wrench },
    { name: "Informs", href: "/admin/informs", icon: FileText },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Tool Tracker Admin
                </h2>
                <p className="text-xs text-gray-400 mt-1">Management Portal</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                        : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-gray-700">
              <Link
                href="/admin"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all group"
              >
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium">Settings</span>
              </Link>
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-700">
            <div className="bg-gray-700/50 rounded-lg p-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{adminName}</p>
                  {/* <p className="text-xs text-gray-400 truncate">{adminEmail}</p> */}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/10 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="flex-1 lg:flex-none">
                <h1 className="text-xl font-semibold text-gray-900 ml-4 lg:ml-0">
                  {navigation.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"))?.name || "Admin"}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <div className="px-4 lg:px-8 py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <p>© 2024 Inform Admin. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-900 transition">Privacy</a>
              <a href="#" className="hover:text-gray-900 transition">Terms</a>
              <a href="#" className="hover:text-gray-900 transition">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}