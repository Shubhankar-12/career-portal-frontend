"use client";

import type React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { authAPI, jobAPI } from "@/lib/api";
import { AuthGuard } from "@/components/shared/auth-guard";
import { toast } from "react-toastify";
import CurrencySelect from "@/components/CurrencySelect";

function JobFormContent() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<{
    title: string;
    location: string;
    work_policy: "Remote" | "Hybrid" | "Onsite";
    department: string;
    employment_type: string;
    experience_level: string;
    job_type: string;
    description: string;
    salary_type: "CONFIDENTIAL" | "RANGE" | "FIXED"; // ✅ strict type here
    min_salary: string;
    max_salary: string;
    salary_fixed: string;
    salary_frequency: "MONTHLY" | "YEARLY";
    currency: string;
  }>({
    title: "",
    location: "",
    work_policy: "Remote",
    department: "",
    employment_type: "Full-Time",
    experience_level: "Mid-Level",
    job_type: "Permanent",
    description: "",
    salary_type: "CONFIDENTIAL",
    salary_frequency: "YEARLY",
    min_salary: "",
    max_salary: "",
    salary_fixed: "",
    currency: "INR",
  });

  // ✅ handle input change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!user) throw new Error("Not authenticated");

      const company = await authAPI.getUserById(user.user_id);
      if (!company) throw new Error("Company not found");

      const jobData = {
        company_id: company.company!.company_id!,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        work_policy: formData.work_policy,
        department: formData.department,
        employment_type: formData.employment_type,
        experience_level: formData.experience_level,
        job_type: formData.job_type,
        salary_type: formData.salary_type,
        min_salary:
          formData.salary_type === "RANGE"
            ? Number(formData.min_salary)
            : undefined,
        max_salary:
          formData.salary_type === "RANGE"
            ? Number(formData.max_salary)
            : undefined,
        salary_fixed:
          formData.salary_type === "FIXED"
            ? Number(formData.salary_fixed)
            : undefined,
        currency: formData.currency,
        status: "OPEN" as const,
      };

      const job = await jobAPI.create(jobData);
      if (job) {
        toast.success("Job created successfully");
        router.push("/jobs");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  // ✅ render salary inputs conditionally
  const renderSalaryFields = () => {
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
                value={formData.min_salary}
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
                value={formData.max_salary}
                onChange={handleChange}
                className="input"
                placeholder="e.g., 1200000"
              />
            </div>
            <div>
              <label
                htmlFor="salary_frequency"
                className="block text-sm font-medium mb-2"
              >
                Salary Frequency
              </label>
              <select
                id="salary_frequency"
                name="salary_frequency"
                value={formData.salary_frequency || "YEARLY"}
                onChange={(e) =>
                  setFormData((prev) =>
                    prev
                      ? {
                          ...prev,
                          salary_frequency: e.target.value as
                            | "YEARLY"
                            | "MONTHLY",
                        }
                      : prev
                  )
                }
                className="input"
              >
                <option value="YEARLY">Yearly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          </div>
        );

      case "FIXED":
        return (
          <>
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
                value={formData.salary_fixed}
                onChange={handleChange}
                className="input"
                placeholder="e.g., 1000000"
              />
            </div>
            <div>
              <label
                htmlFor="salary_frequency"
                className="block text-sm font-medium mb-2"
              >
                Salary Frequency
              </label>
              <select
                id="salary_frequency"
                name="salary_frequency"
                value={formData.salary_frequency || "YEARLY"}
                onChange={(e) =>
                  setFormData((prev) =>
                    prev
                      ? {
                          ...prev,
                          salary_frequency: e.target.value as
                            | "YEARLY"
                            | "MONTHLY",
                        }
                      : prev
                  )
                }
                className="input"
              >
                <option value="YEARLY">Yearly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          </>
        );

      default:
        return (
          <p className="text-sm text-text-secondary italic">
            Salary will remain confidential.
          </p>
        );
    }
  };

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
          <h1 className="text-2xl font-bold">Add New Job</h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Job Title and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Job Title
              </label>
              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Senior React Developer"
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
                value={formData.location}
                onChange={handleChange}
                className="input"
                placeholder="e.g., San Francisco, CA"
              />
            </div>
          </div>

          {/* Work Policy and Details */}
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
                value={formData.work_policy}
                onChange={handleChange}
                className="input"
              >
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
                value={formData.employment_type}
                onChange={handleChange}
                className="input"
              >
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
                value={formData.experience_level}
                onChange={handleChange}
                className="input"
              >
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="job_type"
                className="block text-sm font-medium mb-2"
              >
                Job Type
              </label>
              <select
                id="job_type"
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                className="input"
              >
                <option value="Permanent">Permanent</option>
                <option value="Temporary">Temporary</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          {/* Department */}
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
              value={formData.department}
              onChange={handleChange}
              className="input"
              placeholder="e.g., Engineering"
            />
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
              value={formData.salary_type}
              onChange={handleChange}
              className="input"
            >
              <option value="CONFIDENTIAL">Confidential</option>
              <option value="RANGE">Range</option>
              <option value="FIXED">Fixed</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium mb-2"
            >
              Currency
            </label>
            <CurrencySelect
              value={formData.currency || "INR"}
              onChange={(value) =>
                setFormData({ ...formData, currency: value })
              }
              id="currency"
              name="currency"
            />
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
              value={formData.description}
              onChange={handleChange}
              className="input min-h-32"
              placeholder="Enter job description..."
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Job"}
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

export default function JobNewPage() {
  return (
    <AuthGuard>
      <JobFormContent />
    </AuthGuard>
  );
}
