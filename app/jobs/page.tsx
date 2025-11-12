"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  authAPI,
  companyAPI,
  jobAPI,
  type Job,
  type JobListResponse,
} from "@/lib/api";
import { AuthGuard } from "@/components/shared/auth-guard";

import { toast } from "react-toastify";
// Filter Enums
const SortEnum = ["highest", "lowest", "newest", "oldest"] as const;
const WorkTypeEnum = ["Remote", "Hybrid", "Onsite"] as const;
const SalaryTypeEnum = ["CONFIDENTIAL", "RANGE", "FIXED"] as const;

function JobsContent() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "OPEN" | "CLOSED">(
    "all"
  );
  const [workModeFilter, setWorkModeFilter] = useState<
    "all" | "Remote" | "Hybrid" | "Onsite"
  >("all");
  const [salaryTypeFilter, setSalaryTypeFilter] = useState<
    "all" | "CONFIDENTIAL" | "RANGE" | "FIXED"
  >("all");
  const [sortFilter, setSortFilter] = useState<
    "highest" | "lowest" | "newest" | "oldest"
  >("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  // 🧩 Fetch all jobs with filters
  const fetchAllJobs = async () => {
    if (!user?.company_id) return;
    try {
      setLoading(true);

      const filters = {
        company_id: user.company_id,
        search: searchTerm || undefined,
        work_policy: workModeFilter !== "all" ? workModeFilter : undefined,
        salary_type: salaryTypeFilter !== "all" ? salaryTypeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        sort_by: sortFilter || undefined,
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };

      const response: JobListResponse = await jobAPI.getAllJobs(filters);
      setJobs(response.result);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Fetch company info
  const fetchCompany = async () => {
    if (!user) return;
    const company = await authAPI.getUserById(user.user_id);
    setCompany(company);
  };

  // 🔁 Refetch when filters change
  useEffect(() => {
    if (user) {
      fetchCompany();
      fetchAllJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    searchTerm,
    statusFilter,
    workModeFilter,
    salaryTypeFilter,
    sortFilter,
    currentPage,
  ]);

  // 🗂️ Handle archive
  const handleArchive = async (jobId: string, title: string) => {
    try {
      const response = await jobAPI.update(jobId, { status: "CLOSED" });

      if (response) {
        setJobs((prev) =>
          prev.map((j) => (j.job_id === jobId ? { ...j, status: "CLOSED" } : j))
        );
        toast.success(`Job "${title}" archived successfully`);
      }
    } catch (error) {
      console.error("Failed to archive job:", error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  if (!company) {
    return (
      <div className="text-center p-8">
        <p className="text-text-secondary">Company not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-text-secondary hover:text-primary mb-2 block text-sm"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Jobs Management</h1>
          </div>
          <Link href="/jobs/new" className="btn-primary">
            + Add Job
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input"
            />

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "all" | "OPEN" | "CLOSED");
                setCurrentPage(1);
              }}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>

            {/* Work Policy */}
            <select
              value={workModeFilter}
              onChange={(e) => {
                setWorkModeFilter(
                  e.target.value as "all" | "Remote" | "Hybrid" | "Onsite"
                );
                setCurrentPage(1);
              }}
              className="input"
            >
              <option value="all">All Work Modes</option>
              {WorkTypeEnum.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Salary Type */}
            <select
              value={salaryTypeFilter}
              onChange={(e) => {
                setSalaryTypeFilter(
                  e.target.value as "all" | "CONFIDENTIAL" | "RANGE" | "FIXED"
                );
                setCurrentPage(1);
              }}
              className="input"
            >
              <option value="all">All Salary Types</option>
              {SalaryTypeEnum.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortFilter}
              onChange={(e) =>
                setSortFilter(
                  e.target.value as "highest" | "lowest" | "newest" | "oldest"
                )
              }
              className="input"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest Salary</option>
              <option value="lowest">Lowest Salary</option>
            </select>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Title</th>
                <th className="text-left py-3 px-4 font-semibold">Location</th>
                <th className="text-left py-3 px-4 font-semibold">Work Mode</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Salary Type
                </th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr
                    key={job.job_id}
                    className="border-b border-border hover:bg-secondary/20 transition"
                  >
                    <td className="py-3 px-4">{job.title}</td>
                    <td className="py-3 px-4 text-text-secondary">
                      {job.location || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm bg-secondary/50 px-2 py-1 rounded">
                        {job.work_policy || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {job.salary_type || "CONFIDENTIAL"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          job.status === "OPEN"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/jobs/${job.job_id}/edit`}
                          className="text-accent hover:underline text-sm"
                        >
                          Edit
                        </Link>
                        {job.status === "OPEN" && (
                          <button
                            onClick={() => handleArchive(job.job_id, job.title)}
                            className="text-text-secondary hover:text-primary text-sm"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-text-secondary"
                  >
                    No jobs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {jobs.length > 0 && (
          <div className="flex justify-between items-center mt-8">
            <div className="text-text-secondary text-sm">
              Page {currentPage}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-secondary/50 text-primary rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-4 py-2 bg-secondary/50 text-primary rounded"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function JobsPage() {
  return (
    <AuthGuard>
      <JobsContent />
    </AuthGuard>
  );
}
