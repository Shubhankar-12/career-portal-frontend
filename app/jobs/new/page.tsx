"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { companyAPI, jobAPI } from "@/lib/api"
import { AuthGuard } from "@/components/shared/auth-guard"

function JobFormContent() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    workPolicy: "Remote",
    department: "",
    employmentType: "Full-time",
    experienceLevel: "Mid-level",
    jobType: "Permanent",
    salaryRange: "",
    description: "<p>Enter job description here</p>",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!user) throw new Error("Not authenticated")

      const company = companyAPI.getByRecruiterId(user.id)
      if (!company) throw new Error("Company not found")

      const job = jobAPI.create(company.id, {
        ...formData,
        status: "active",
      })

      router.push("/jobs")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/jobs" className="text-text-secondary hover:text-primary mb-2 block text-sm">
            ← Back to Jobs
          </Link>
          <h1 className="text-2xl font-bold">Add New Job</h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">{error}</div>}

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
              <label htmlFor="location" className="block text-sm font-medium mb-2">
                Location
              </label>
              <input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input"
                placeholder="e.g., San Francisco, CA"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label htmlFor="workPolicy" className="block text-sm font-medium mb-2">
                Work Policy
              </label>
              <select
                id="workPolicy"
                name="workPolicy"
                value={formData.workPolicy}
                onChange={handleChange}
                className="input"
              >
                <option>Remote</option>
                <option>Hybrid</option>
                <option>Onsite</option>
              </select>
            </div>
            <div>
              <label htmlFor="employmentType" className="block text-sm font-medium mb-2">
                Employment Type
              </label>
              <select
                id="employmentType"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="input"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
              </select>
            </div>
            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-medium mb-2">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="input"
              >
                <option>Junior</option>
                <option>Mid-level</option>
                <option>Senior</option>
                <option>Lead</option>
              </select>
            </div>
            <div>
              <label htmlFor="salaryRange" className="block text-sm font-medium mb-2">
                Salary Range
              </label>
              <input
                id="salaryRange"
                name="salaryRange"
                value={formData.salaryRange}
                onChange={handleChange}
                className="input"
                placeholder="$100k - $150k"
              />
            </div>
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium mb-2">
              Department
            </label>
            <input
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="input"
              placeholder="e.g., Engineering"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
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
            <p className="text-xs text-text-secondary mt-1">HTML supported for rich formatting</p>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? "Creating..." : "Create Job"}
            </button>
            <Link href="/jobs" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}

export default function JobNewPage() {
  return (
    <AuthGuard>
      <JobFormContent />
    </AuthGuard>
  )
}
