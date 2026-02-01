"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  FileText,
  Calendar,
  TrendingUp,
  RefreshCw,
  Grid,
  List,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [informs, setInforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // list or grid
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInforms();
  }, []);

  const fetchInforms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/informs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        throw new Error(`Failed to fetch informs: ${res.status}`);
      }

      const data = await res.json();
      console.log("data", data);
      
      setInforms(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching informs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInforms();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleRowClick = (id) => {
    router.push(`/dashboard/inform/${id}`);
  };

  // Filter and search informs
  const filteredInforms = informs.filter((inform) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "open" && inform.status === "OPEN") ||
      (filter === "completed" && inform.status === "COMPLETED");

    const matchesSearch =
      inform.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inform.tool?.toolNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inform.module?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: informs.length,
    open: informs.filter((i) => i.status === "OPEN").length,
    completed: informs.filter((i) => i.status === "COMPLETED").length,
    recent: informs.filter(
      (i) =>
        new Date(i.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-medium">Error loading informs: {error}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 text-red-600 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back! Here's what's happening with your informs.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
                disabled={refreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span className="text-sm font-medium">Refresh</span>
              </button>
              <Link
                href="/dashboard/create-inform"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">New Inform</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Informs"
            value={stats.total}
            icon={<FileText className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Open"
            value={stats.open}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Updated This Week"
            value={stats.recent}
            icon={<TrendingUp className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tool, title, or module..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                  filter === "all"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All ({informs.length})
              </button>
              <button
                onClick={() => setFilter("open")}
                className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                  filter === "open"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Open ({stats.open})
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                  filter === "completed"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Completed ({stats.completed})
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 border border-gray-300 rounded-lg p-1 bg-gray-50">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredInforms.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === "all" ? "No informs yet" : `No ${filter} informs`}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try adjusting your search terms"
                : filter === "all"
                ? "Get started by creating your first inform"
                : `You don't have any ${filter} informs at the moment`}
            </p>
            {filter === "all" && !searchTerm && (
              <Link
                href="/dashboard/create-inform"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Create Your First Inform
              </Link>
            )}
          </div>
        ) : viewMode === "list" ? (
          <ListView informs={filteredInforms} onClick={handleRowClick} />
        ) : (
          <GridView informs={filteredInforms} onClick={handleRowClick} />
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// List View Component
function ListView({ informs, onClick }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tool
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Module
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Last Updated By
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {informs.map((inform) => (
              <tr
                key={inform._id}
                onClick={() => onClick(inform._id)}
                className="hover:bg-gray-50 cursor-pointer transition group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {inform.tool?.toolNumber || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition">
                    {inform.title || "Untitled"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {inform.module || "—"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={inform.status} />
                </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {inform.createdBy.name || "—"}
                  </span>
                </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {inform.lastEditedBy.name || "—"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(inform.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Grid View Component
function GridView({ informs, onClick }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {informs.map((inform) => (
        <div
          key={inform._id}
          onClick={() => onClick(inform._id)}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-mono rounded mb-2">
                {inform.tool?.toolNumber || "N/A"}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                {inform.title || "Untitled"}
              </h3>
            </div>
            <StatusBadge status={inform.status} />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="w-4 h-4" />
              <span>{inform.module || "No module"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(inform.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-blue-600 group-hover:text-blue-700 font-medium">
              View details →
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }) {
  const config = {
    OPEN: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      dot: "bg-yellow-500",
    },
    COMPLETED: {
      bg: "bg-green-100",
      text: "text-green-800",
      dot: "bg-green-500",
    },
  };

  const style = config[status] || config.OPEN;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {status}
    </span>
  );
}