"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InformEditor from "@/components/InformEditor";
import {
  ArrowLeft,
  Wrench,
  FileText,
  Type,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function CreateInform() {
  const router = useRouter();
  const [tools, setTools] = useState([]);
  const [tool, setTool] = useState("");
  const [module, setModule] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/tools", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch tools");
      }

      const data = await res.json();
      
      // Ensure tools is always an array
      if (Array.isArray(data)) {
        setTools(data);
      } else if (Array.isArray(data.tools)) {
        setTools(data.tools);
      } else {
        setTools([]);
      }
    } catch (err) {
      console.error("Error fetching tools:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    // Validation
    if (!tool) {
      alert("Please select a tool");
      return;
    }
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!content.trim()) {
      alert("Please add some content");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/informs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tool,
          module: module || undefined,
          title,
          content,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create inform");
      }

      // Success - redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error creating inform:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTool = Array.isArray(tools)
    ? tools.find((t) => t._id === tool)
    : null;

  const isFormValid = tool && title.trim() && content.trim();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading tools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-red-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800">Error</h2>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Back</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create New Inform</h1>
                <p className="text-sm text-gray-600 hidden sm:block">
                  Fill in the details below to create a new inform
                </p>
              </div>
            </div>

            <button
              onClick={submit}
              disabled={!isFormValid || submitting}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Inform</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <ProgressStep
              number={1}
              label="Select Tool"
              completed={!!tool}
              active={!tool}
            />
            <div className="flex-1 h-0.5 bg-gray-200">
              <div
                className={`h-full transition-all duration-300 ${
                  tool ? "bg-blue-600 w-full" : "bg-gray-200 w-0"
                }`}
              />
            </div>
            <ProgressStep
              number={2}
              label="Add Details"
              completed={!!title && !!content}
              active={!!tool && (!title || !content)}
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Tool Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Select Tool</h2>
                <p className="text-sm text-gray-600">
                  Choose the tool this inform is related to
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tool <span className="text-red-500">*</span>
                </label>
                <select
                  value={tool}
                  onChange={(e) => {
                    setTool(e.target.value);
                    setModule(""); // Reset module when tool changes
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select a tool...</option>
                  {Array.isArray(tools) &&
                    tools.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.toolNumber} - {t.toolId} ({t.client})
                      </option>
                    ))}
                </select>
                {tools.length === 0 && (
                  <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    No tools available. Please create a tool first.
                  </p>
                )}
              </div>

              {selectedTool?.modules && selectedTool.modules.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module (Optional)
                  </label>
                  <select
                    value={module}
                    onChange={(e) => setModule(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select a module...</option>
                    {selectedTool.modules.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedTool && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tool Number:</span>
                      <p className="font-semibold text-gray-900">
                        {selectedTool.toolNumber}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Client:</span>
                      <p className="font-semibold text-gray-900">
                        {selectedTool.client}
                      </p>
                    </div>
                    {selectedTool.bayArea && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Bay Area:</span>
                        <p className="font-semibold text-gray-900">
                          {selectedTool.bayArea}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Type className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Inform Title</h2>
                <p className="text-sm text-gray-600">
                  Provide a clear, descriptive title
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Issue with Module X alignment"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-2">
                {title.length}/200 characters
              </p>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Inform Content</h2>
                <p className="text-sm text-gray-600">
                  Describe the issue, observation, or information in detail
                </p>
              </div>
            </div>

            <InformEditor value={content} onChange={setContent} />
          </div>

          {/* Validation Summary */}
          {(tool || title || content) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">
                Form Completion
              </h3>
              <div className="space-y-2">
                <ValidationItem
                  label="Tool selected"
                  completed={!!tool}
                />
                <ValidationItem
                  label="Title provided"
                  completed={!!title.trim()}
                />
                <ValidationItem
                  label="Content added"
                  completed={!!content.trim()}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
            <div>
              <p className="font-semibold text-gray-900">Ready to create?</p>
              <p className="text-sm text-gray-600 mt-1">
                {isFormValid
                  ? "All required fields are filled. Click create to submit."
                  : "Please complete all required fields to continue."}
              </p>
            </div>
            <button
              onClick={submit}
              disabled={!isFormValid || submitting}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Inform
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress Step Component
function ProgressStep({ number, label, completed, active }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
          completed
            ? "bg-blue-600 text-white"
            : active
            ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        {completed ? <CheckCircle className="w-5 h-5" /> : number}
      </div>
      <span
        className={`text-sm font-medium hidden sm:inline ${
          completed || active ? "text-gray-900" : "text-gray-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// Validation Item Component
function ValidationItem({ label, completed }) {
  return (
    <div className="flex items-center gap-3">
      {completed ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
      )}
      <span
        className={`text-sm ${
          completed ? "text-green-900 font-medium" : "text-gray-600"
        }`}
      >
        {label}
      </span>
    </div>
  );
}