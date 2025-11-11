"use client"

import type React from "react"

import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { jobAPI, type Job } from "@/lib/api"
import { AuthGuard } from "@/components/shared/auth-guard"

function JobEditContent() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<Partial<Job> | null>(null)

  useEffect(() => {
    const job = jobAPI.getById(jobId)
    if (!job) {
      setError("Job not found")
      return
    }
    setFormData(job)
    setLoading(false)
  }, [jobId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setError("")
    setSaving(true)

    try {
      jobAPI.update(jobId, formData)
      router.push("/jobs")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update job")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
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
    )
  }

  if (!formData) return null

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/jobs" className="text-text-secondary hover:text-primary mb-2 block text-sm">
            ← Back to Jobs
          </Link>
          <h1 className="text-2xl font-bold">Edit Job</h1>
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
                value={formData.title || ""}
                onChange={handleChange}
                className="input"
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
                value={formData.location || ""}
                onChange={handleChange}
                className="input"
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
                value={formData.workPolicy || ""}
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
                value={formData.employmentType || ""}
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
                value={formData.experienceLevel || ""}
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
                value={formData.salaryRange || ""}
                onChange={handleChange}
                className="input"
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
              value={formData.department || ""}
              onChange={handleChange}
              className="input"
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
              value={formData.description || ""}
              onChange={handleChange}
              className="input min-h-32"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status
            </label>
            <select id="status" name="status" value={formData.status || ""} onChange={handleChange} className="input">
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
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

export default function JobEditPage() {
  return (
    <AuthGuard>
      <JobEditContent />
    </AuthGuard>
  )
}
