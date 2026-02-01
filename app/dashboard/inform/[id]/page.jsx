"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import InformEditor from "@/components/InformEditor";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Lock,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function InformPage() {
  const { id } = useParams();
  const router = useRouter();

  const [inform, setInform] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load inform data
  useEffect(() => {
    const fetchInform = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No authentication token found");
        }

        const res = await fetch(`/api/informs/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to load inform: ${res.status}`);
        }

        const data = await res.json();
        setInform(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching inform:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInform();
    }
  }, [id]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Save content
  const save = async () => {
    if (!inform?.content) {
      alert("No content to save");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await fetch(`/api/informs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: inform.content }),
      });

      if (!res.ok) {
        throw new Error(`Save failed: ${res.status}`);
      }

      const updated = await res.json();
      setInform(updated);
      setHasUnsavedChanges(false);
      
      // Show success notification
      showNotification("Saved successfully!", "success");
    } catch (err) {
      showNotification(`Error saving: ${err.message}`, "error");
      console.error("Error saving inform:", err);
    } finally {
      setSaving(false);
    }
  };

  // Update status (admin only)
  const updateStatus = async (status) => {
    if (!confirm(`Are you sure you want to mark this inform as ${status.toLowerCase()}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await fetch(`/api/informs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error(`Status update failed: ${res.status}`);
      }

      const updated = await res.json();
      setInform(updated);
      showNotification(`Status updated to ${status}`, "success");
    } catch (err) {
      showNotification(`Error updating status: ${err.message}`, "error");
      console.error("Error updating status:", err);
    }
  };

  const showNotification = (message, type) => {
    // Simple notification - you can replace with a proper toast library
    alert(message);
  };

  const handleContentChange = (content) => {
    setInform({ ...inform, content });
    setHasUnsavedChanges(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading inform...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-red-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800">Error Loading Inform</h2>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!inform) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Inform Not Found</h2>
          <p className="text-gray-600 mb-6">The inform you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const locked = inform.status === "COMPLETED" && !inform.isAdmin;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back button and title */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Back</span>
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 truncate">
                  {inform.title || "Untitled Inform"}
                </h1>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {!locked && (
                <button
                  onClick={save}
                  disabled={saving || !hasUnsavedChanges}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {hasUnsavedChanges ? "Save Changes" : "Saved"}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoItem
              icon={<FileText className="w-5 h-5" />}
              label="Tool"
              value={inform.tool?.toolNumber || "N/A"}
            />
            <InfoItem
              icon={<User className="w-5 h-5" />}
              label="Created By"
              value={inform.createdBy?.name || "Unknown"}
            />
            <InfoItem
              icon={<Calendar className="w-5 h-5" />}
              label="Last Updated"
              value={new Date(inform.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            />
            <InfoItem
              icon={<Clock className="w-5 h-5" />}
              label="Status"
              value={
                <StatusBadge
                  status={inform.status}
                  locked={locked}
                />
              }
            />
          </div>

          {/* Module info if exists */}
          {inform.module && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span className="font-medium">Module:</span>
                <span>{inform.module}</span>
              </div>
            </div>
          )}
        </div>

        {/* Status Change Buttons (Admin Only) */}
        {inform.isAdmin && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Admin Controls</h3>
                <p className="text-sm text-gray-600">Manage inform status</p>
              </div>
            </div>
            <div className="flex gap-3">
              {inform.status === "OPEN" ? (
                <button
                  onClick={() => updateStatus("COMPLETED")}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Completed
                </button>
              ) : (
                <button
                  onClick={() => updateStatus("OPEN")}
                  className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition shadow-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Reopen Inform
                </button>
              )}
            </div>
          </div>
        )}

        {/* Locked Notice */}
        {locked && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">This inform is locked</p>
              <p className="text-sm text-amber-700 mt-1">
                This inform has been marked as completed and is locked for editing. Only administrators can reopen it.
              </p>
            </div>
          </div>
        )}

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && !locked && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">You have unsaved changes</p>
              <p className="text-sm text-blue-700 mt-1">
                Don't forget to save your work before leaving this page.
              </p>
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <InformEditor
            value={inform.content}
            onChange={handleContentChange}
            disabled={locked}
          />
        </div>

        {/* Footer Actions */}
        {!locked && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {hasUnsavedChanges ? (
                <span className="text-amber-600 font-medium">● Unsaved changes</span>
              ) : (
                <span className="text-green-600">✓ All changes saved</span>
              )}
            </p>
            <button
              onClick={save}
              disabled={saving || !hasUnsavedChanges}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Info Item Component
function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status, locked }) {
  const config = {
    OPEN: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    COMPLETED: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
  };

  const style = config[status] || config.OPEN;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      {style.icon}
      {status}
      {locked && <Lock className="w-3 h-3 ml-0.5" />}
    </span>
  );
}