"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { companyAPI, jobAPI, type Job } from "@/lib/api"
import { AuthGuard } from "@/components/shared/auth-guard"

function JobsContent() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [jobs, setJobs] = useState<Job[]>([])
  const [company, setCompany] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all")
  const [workModeFilter, setWorkModeFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const itemsPerPage = 10

  useEffect(() => {
    if (!user) return

    const comp = companyAPI.getByRecruiterId(user.id)
    if (!comp) {
      setLoading(false)
      return
    }

    setCompany(comp)
    const companyJobs = jobAPI.getByCompanyId(comp.id)
    setJobs(companyJobs)
    setLoading(false)
  }, [user])

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    const matchesWorkMode = workModeFilter === "all" || job.workPolicy === workModeFilter

    return matchesSearch && matchesStatus && matchesWorkMode
  })

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleArchive = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId)
    if (job) {
      jobAPI.update(jobId, { status: "archived" })
      setJobs(jobs.map((j) => (j.id === jobId ? { ...j, status: "archived" } : j)))
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!company) {
    return (
      <div className="text-center p-8">
        <p className="text-text-secondary">Company not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-text-secondary hover:text-primary mb-2 block text-sm">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Jobs Management</h1>
          </div>
          <Link href="/jobs/new" className="btn-primary">
            + Add Job
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="input"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "all" | "active" | "archived")
                setCurrentPage(1)
              }}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={workModeFilter}
              onChange={(e) => {
                setWorkModeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="input"
            >
              <option value="all">All Work Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
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
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedJobs.map((job) => (
                <tr key={job.id} className="border-b border-border hover:bg-secondary/20 transition">
                  <td className="py-3 px-4">{job.title}</td>
                  <td className="py-3 px-4 text-text-secondary">{job.location}</td>
                  <td className="py-3 px-4">
                    <span className="text-sm bg-secondary/50 px-2 py-1 rounded">{job.workPolicy}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        job.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Link href={`/jobs/${job.id}/edit`} className="text-accent hover:underline text-sm">
                        Edit
                      </Link>
                      {job.status === "active" && (
                        <button
                          onClick={() => handleArchive(job.id)}
                          className="text-text-secondary hover:text-primary text-sm"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-8">
            <div className="text-text-secondary text-sm">
              Page {currentPage} of {totalPages}
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
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-secondary/50 text-primary rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function JobsPage() {
  return (
    <AuthGuard>
      <JobsContent />
    </AuthGuard>
  )
}
