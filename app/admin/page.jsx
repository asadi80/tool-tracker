"use client";
import Link from "next/link";
import { Users, Wrench, FileText, Plus, BarChart3, Settings } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your system users, tools, and informs
        </p>
      </div>

      {/* Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModernCard
          title="Users"
          desc="Manage user accounts, roles, and permissions"
          link="/admin/users"
          Icon={Users}
          color="blue"
          // count="124"
        />
        <ModernCard
          title="Tools"
          desc="Manage tools, equipment, and inventory"
          link="/admin/tools"
          Icon={Wrench}
          color="purple"
          // count="48"
        />
        <ModernCard
          title="Informs"
          desc="View and manage all inform submissions"
          link="/admin/informs"
          Icon={FileText}
          color="green"
          // count="89"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <ActionButton href="/admin/users/create" Icon={Plus}>
            Add User
          </ActionButton>
          <ActionButton href="/admin/tools/create" Icon={Wrench}>
            Add Tool
          </ActionButton>
          <ActionButton href="/admin/reports" Icon={BarChart3}>
            Reports
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

function ModernCard({ title, desc, link, Icon, color, count }) {
  const colorClasses = {
    blue: "bg-blue-500 hover:bg-blue-600",
    purple: "bg-purple-500 hover:bg-purple-600",
    green: "bg-green-500 hover:bg-green-600",
  };

  return (
    <Link
      href={link}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Icon header */}
      <div className={`${colorClasses[color]} p-6 transition-colors`}>
        <div className="flex items-center justify-between text-white">
          <Icon className="w-12 h-12" strokeWidth={1.5} />
          {count && (
            <span className="text-3xl font-bold opacity-90">{count}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h2>
        <p className="text-gray-600 text-sm">{desc}</p>
        
        <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
          Manage <span className="ml-1 group-hover:ml-2 transition-all">→</span>
        </div>
      </div>
    </Link>
  );
}

function ActionButton({ href, Icon, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all"
    >
      <Icon className="w-4 h-4 text-gray-600" />
      <span className="text-sm font-medium text-gray-700">{children}</span>
    </Link>
  );
}