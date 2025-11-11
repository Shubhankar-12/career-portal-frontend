"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { companyAPI, jobAPI, type Company, type Job } from "@/lib/api"
import { AuthGuard } from "@/components/shared/auth-guard"

function PreviewContent() {
  const params = useParams()
  const slug = params["company-slug"] as string
  const user = useAuthStore((state) => state.user)
  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    const comp = companyAPI.getBySlug(slug)
    if (!comp) {
      setLoading(false)
      return
    }

    if (user && comp.recruiterId !== user.id) {
      setLoading(false)
      return
    }

    setCompany(comp)
    const companyJobs = jobAPI.getByCompanyId(comp.id).filter((j) => j.status === "active")
    setJobs(companyJobs)
    setLoading(false)
  }, [slug, user])

  const handlePublish = () => {
    if (!company) return
    setPublishing(true)
    try {
      companyAPI.update(company.id, { published: !company.published })
      setCompany({ ...company, published: !company.published })
    } finally {
      setPublishing(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!company) return null
  if (user && company.recruiterId !== user.id) return null

  return (
    <div className="min-h-screen" style={{ backgroundColor: company.theme.backgroundColor }}>
      {/* Recruiter Sticky Bar */}
      {user && company.recruiterId === user.id && (
        <div className="border-b border-border/50 py-3 px-6 bg-background/90 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href={`/${slug}/edit`} className="text-accent hover:underline text-sm">
              ← Back to Editor
            </Link>
            <div className="space-x-4">
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="text-sm px-3 py-1 bg-secondary/50 rounded hover:bg-secondary/70 disabled:opacity-50"
              >
                {company.published ? "Unpublish" : "Publish"}
              </button>
              <a
                href={`/${slug}/careers`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-1 bg-accent/20 text-accent rounded hover:bg-accent/30"
              >
                View Public Page →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Career Page Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        {company.sections.includes("hero") && (
          <section className="mb-16 text-center space-y-6">
            {company.logo && (
              <img src={company.logo || "/placeholder.svg"} alt={company.name} className="h-16 w-auto mx-auto" />
            )}
            <h1 className="text-5xl font-bold" style={{ color: company.theme.primaryColor }}>
              Join {company.name}
            </h1>
            <p className="text-xl" style={{ color: company.theme.textColor }}>
              We're hiring! Explore open positions and join our team.
            </p>
          </section>
        )}

        {/* About Section */}
        {company.sections.includes("about") && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6" style={{ color: company.theme.primaryColor }}>
              About {company.name}
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: company.theme.textColor }}>
              {company.name} is a leading organization dedicated to innovation and excellence. We believe in empowering
              our team members to achieve their best work.
            </p>
          </section>
        )}

        {/* Life Section */}
        {company.sections.includes("life") && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6" style={{ color: company.theme.primaryColor }}>
              Life at {company.name}
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: company.theme.textColor }}>
              Our culture emphasizes collaboration, creativity, and continuous learning. We offer a supportive
              environment where everyone can thrive.
            </p>
          </section>
        )}

        {/* Perks Section */}
        {company.sections.includes("perks") && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6" style={{ color: company.theme.primaryColor }}>
              Why Join Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["Competitive Salary", "Flexible Work", "Great Team"].map((perk) => (
                <div
                  key={perk}
                  className="p-6 rounded-lg"
                  style={{
                    backgroundColor: company.theme.secondaryColor,
                    color: company.theme.textColor,
                  }}
                >
                  <h3 className="font-bold mb-2">{perk}</h3>
                  <p className="text-sm opacity-90">We take care of our team members</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Jobs Section */}
        <section>
          <h2 className="text-3xl font-bold mb-8" style={{ color: company.theme.primaryColor }}>
            Open Positions
          </h2>
          {jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-6 rounded-lg border border-border"
                  style={{
                    backgroundColor: company.theme.secondaryColor,
                    color: company.theme.textColor,
                  }}
                >
                  <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm opacity-75">
                    <span>{job.location}</span>
                    <span>{job.workPolicy}</span>
                    <span>{job.department}</span>
                  </div>
                  <p className="mt-4 line-clamp-2">{job.salaryRange}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary">No open positions at the moment.</p>
          )}
        </section>
      </main>
    </div>
  )
}

export default function PreviewPage() {
  return (
    <AuthGuard>
      <PreviewContent />
    </AuthGuard>
  )
}
