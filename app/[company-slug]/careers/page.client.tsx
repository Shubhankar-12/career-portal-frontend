"use client"

import { useParams } from "next/navigation"

import { useEffect, useState } from "react"
import { companyAPI, jobAPI, type Company, type Job } from "@/lib/api"
import { notFound } from "next/navigation"

export default function PublicCareersPageClient() {
  const params = useParams()
  const slug = params["company-slug"] as string
  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [workModeFilter, setWorkModeFilter] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const comp = companyAPI.getBySlug(slug)
    if (!comp || !comp.published) {
      setLoading(false)
      return
    }

    setCompany(comp)
    const companyJobs = jobAPI.getByCompanyId(comp.id).filter((j) => j.status === "active")
    setJobs(companyJobs)
    setLoading(false)
  }, [slug])

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase())
    const matchesWorkMode = !workModeFilter || job.workPolicy === workModeFilter

    return matchesSearch && matchesLocation && matchesWorkMode
  })

  const locations = [...new Set(jobs.map((j) => j.location))]
  const workModes = [...new Set(jobs.map((j) => j.workPolicy))]

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (!company) {
    notFound()
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: company.theme.backgroundColor }}>
      {/* Header with Logo/Banner */}
      <header className="border-b border-border/50 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          {company.logo && (
            <img src={company.logo || "/placeholder.svg"} alt={company.name} className="h-12 w-auto mb-6" />
          )}
          <h1 className="text-5xl font-bold mb-4" style={{ color: company.theme.primaryColor }}>
            Join {company.name}
          </h1>
          <p className="text-xl" style={{ color: company.theme.textColor }}>
            We're looking for talented people to join our team.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
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

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <input
              type="text"
              placeholder="Search by job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{
                backgroundColor: company.theme.secondaryColor,
                color: company.theme.textColor,
              }}
            />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="input"
              style={{
                backgroundColor: company.theme.secondaryColor,
                color: company.theme.textColor,
              }}
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <select
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
              className="input"
              style={{
                backgroundColor: company.theme.secondaryColor,
                color: company.theme.textColor,
              }}
            >
              <option value="">All Work Modes</option>
              {workModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          {/* Jobs List */}
          {filteredJobs.length > 0 ? (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-6 rounded-lg border border-border hover:shadow-lg transition"
                  style={{
                    backgroundColor: company.theme.secondaryColor,
                    color: company.theme.textColor,
                  }}
                >
                  <h3 className="text-2xl font-bold mb-3">{job.title}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm opacity-75">
                    <div>
                      <p className="text-xs uppercase opacity-75">Location</p>
                      <p className="font-medium">{job.location}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-75">Work Mode</p>
                      <p className="font-medium">{job.workPolicy}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-75">Department</p>
                      <p className="font-medium">{job.department}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-75">Experience</p>
                      <p className="font-medium">{job.experienceLevel}</p>
                    </div>
                  </div>
                  {job.salaryRange && (
                    <p className="text-lg font-semibold mb-4" style={{ color: company.theme.primaryColor }}>
                      {job.salaryRange}
                    </p>
                  )}
                  <p className="mb-4 leading-relaxed line-clamp-3">{job.description}</p>
                  <button
                    className="px-6 py-2 rounded font-medium text-white transition hover:opacity-90"
                    style={{ backgroundColor: company.theme.primaryColor }}
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="p-8 rounded-lg text-center"
              style={{
                backgroundColor: company.theme.secondaryColor,
                color: company.theme.textColor,
              }}
            >
              <p className="text-lg">No positions match your search.</p>
            </div>
          )}
        </section>
      </main>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: company.name,
            url: typeof window !== "undefined" ? window.location.origin : "",
            jobs: filteredJobs.map((job) => ({
              "@type": "JobPosting",
              title: job.title,
              description: job.description,
              jobLocation: {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: job.location,
                },
              },
              employmentType: job.employmentType,
              baseSalary: {
                "@type": "PriceSpecification",
                currency: "USD",
                value: job.salaryRange,
              },
            })),
          }),
        }}
      />
    </div>
  )
}
