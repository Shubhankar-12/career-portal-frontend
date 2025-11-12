"use client";

import type React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { jobAPI, type Job } from "@/lib/api";
import { AuthGuard } from "@/components/shared/auth-guard";

function JobEditContent() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<Job> | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const job = await jobAPI.getById(jobId);
        if (!job) {
          setError("Job not found");
          return;
        }
        setFormData(job);
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !user) return;

    setError("");
    setSaving(true);

    try {
      await jobAPI.update(jobId, {
        ...formData,
        company_id: user.company_id,
        salary_type: formData.salary_type as
          | "CONFIDENTIAL"
          | "RANGE"
          | "FIXED"
          | undefined,
      });
      router.push("/jobs");
    } catch (err) {
      console.error("Error updating job:", err);
      setError(err instanceof Error ? err.message : "Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  const renderSalaryFields = () => {
    if (!formData?.salary_type) return null;

    switch (formData.salary_type) {
      case "RANGE":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="min_salary"
                className="block text-sm font-medium mb-2"
              >
                Minimum Salary
              </label>
              <input
                id="min_salary"
                name="min_salary"
                type="number"
                value={formData.min_salary || ""}
                onChange={handleChange}
                className="input"
                placeholder="e.g., 800000"
              />
            </div>
            <div>
              <label
                htmlFor="max_salary"
                className="block text-sm font-medium mb-2"
              >
                Maximum Salary
              </label>
              <input
                id="max_salary"
                name="max_salary"
                type="number"
                value={formData.max_salary || ""}
                onChange={handleChange}
                className="input"
                placeholder="e.g., 1200000"
              />
            </div>
          </div>
        );

      case "FIXED":
        return (
          <div>
            <label
              htmlFor="salary_fixed"
              className="block text-sm font-medium mb-2"
            >
              Fixed Salary
            </label>
            <input
              id="salary_fixed"
              name="salary_fixed"
              type="number"
              value={formData.salary_fixed || ""}
              onChange={handleChange}
              className="input"
              placeholder="e.g., 1000000"
            />
          </div>
        );

      default:
        return (
          <p className="text-sm text-text-secondary italic">
            Salary is marked as confidential.
          </p>
        );
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/jobs" className="btn-primary">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/jobs"
            className="text-text-secondary hover:text-primary mb-2 block text-sm"
          >
            ← Back to Jobs
          </Link>
          <h1 className="text-2xl font-bold">Edit Job</h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Job Title
              </label>
              <input
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium mb-2"
              >
                Location
              </label>
              <input
                id="location"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label
                htmlFor="work_policy"
                className="block text-sm font-medium mb-2"
              >
                Work Policy
              </label>
              <select
                id="work_policy"
                name="work_policy"
                value={formData.work_policy || ""}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="employment_type"
                className="block text-sm font-medium mb-2"
              >
                Employment Type
              </label>
              <select
                id="employment_type"
                name="employment_type"
                value={formData.employment_type || ""}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="experience_level"
                className="block text-sm font-medium mb-2"
              >
                Experience Level
              </label>
              <select
                id="experience_level"
                name="experience_level"
                value={formData.experience_level || ""}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select</option>
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium mb-2"
              >
                Department
              </label>
              <input
                id="department"
                name="department"
                value={formData.department || ""}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          {/* Salary Type */}
          <div>
            <label
              htmlFor="salary_type"
              className="block text-sm font-medium mb-2"
            >
              Salary Type
            </label>
            <select
              id="salary_type"
              name="salary_type"
              value={formData.salary_type || "CONFIDENTIAL"}
              onChange={(e) =>
                setFormData((prev) =>
                  prev
                    ? {
                        ...prev,
                        salary_type: e.target.value as
                          | "CONFIDENTIAL"
                          | "RANGE"
                          | "FIXED",
                      }
                    : prev
                )
              }
              className="input"
            >
              <option value="CONFIDENTIAL">Confidential</option>
              <option value="RANGE">Range</option>
              <option value="FIXED">Fixed</option>
            </select>
          </div>

          {/* Salary Fields */}
          {renderSalaryFields()}

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              className="input min-h-32"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status || "OPEN"}
              onChange={handleChange}
              className="input"
            >
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/jobs" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function JobEditPage() {
  return (
    <AuthGuard>
      <JobEditContent />
    </AuthGuard>
  );
}
