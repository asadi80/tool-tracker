"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Download,
  Upload,
  Wrench,
  RefreshCw,
} from "lucide-react";

export default function ToolsPage() {
  const [tool, setTool] = useState({
    toolNumber: "",
    toolId: "",
    client: "",
    bayArea: "",
  });
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/tools", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch tools");
      }

      const data = await res.json();
      setTools(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching tools:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTools();
    setTimeout(() => setRefreshing(false), 500);
  };

  const createOrUpdateTool = async () => {
    // Validation
    if (!tool.toolNumber || !tool.toolId || !tool.client) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Not authenticated");
        return;
      }

      const url = editingId ? `/api/tools/${editingId}` : "/api/tools";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tool),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save tool");
      }

      const savedTool = await res.json();

      // Update local state
      if (editingId) {
        setTools((prev) =>
          prev.map((t) => (t._id === editingId ? savedTool : t))
        );
      } else {
        setTools((prev) => [savedTool, ...prev]);
      }

      // Reset form
      setTool({ toolNumber: "", toolId: "", client: "", bayArea: "" });
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      console.error("Error saving tool:", err);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTool = async (id) => {
    if (!confirm("Are you sure you want to delete this tool?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/tools/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete tool");
      }

      setTools((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Error deleting tool:", err);
      alert("Failed to delete tool");
    }
  };

  const startEdit = (tool) => {
    setTool({
      toolNumber: tool.toolNumber,
      toolId: tool.toolId,
      client: tool.client,
      bayArea: tool.bayArea,
    });
    setEditingId(tool._id);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setTool({ toolNumber: "", toolId: "", client: "", bayArea: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const exportToCSV = () => {
    const headers = ["Tool Number", "Tool ID", "Client", "Bay Area"];
    const rows = filteredTools.map((t) => [
      t.toolNumber,
      t.toolId,
      t.client,
      t.bayArea || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tools-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Filter tools based on search
  const filteredTools = tools.filter((tool) =>
    Object.values(tool).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tools Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and monitor all tools in the system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="text-sm font-medium">Refresh</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Tool</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Tools"
          value={tools.length}
          icon={<Wrench className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Unique Clients"
          value={new Set(tools.map((t) => t.client)).size}
          icon={<Wrench className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Bay Areas"
          value={new Set(tools.map((t) => t.bayArea).filter(Boolean)).size}
          icon={<Wrench className="w-5 h-5" />}
          color="green"
        />
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? "Edit Tool" : "Create New Tool"}
            </h2>
            <button
              onClick={cancelEdit}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tool Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., APT401"
                value={tool.toolNumber}
                onChange={(e) =>
                  setTool({ ...tool, toolNumber: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tool ID (Unique) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., TOOL-ABC-123"
                value={tool.toolId}
                onChange={(e) => setTool({ ...tool, toolId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Intel"
                value={tool.client}
                onChange={(e) => setTool({ ...tool, client: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bay Area
              </label>
              <input
                type="text"
                placeholder="e.g., Bay 1"
                value={tool.bayArea}
                onChange={(e) => setTool({ ...tool, bayArea: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={createOrUpdateTool}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Saving..." : editingId ? "Update Tool" : "Create Tool"}</span>
            </button>
            <button
              onClick={cancelEdit}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search and Export */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tools Table */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">Error: {error}</p>
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No tools found</p>
          <p className="text-sm text-gray-500 mt-1">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Create your first tool to get started"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tool #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tool ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Bay Area
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTools.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {t.toolNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{t.toolId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{t.client}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {t.bayArea || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(t)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTool(t._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredTools.length}</span>{" "}
              of <span className="font-medium">{tools.length}</span> tools
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}