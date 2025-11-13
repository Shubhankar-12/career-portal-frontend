"use client";

import { useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { jobAPI, JobListResponse, type Company, type Job } from "@/lib/api";
import DOMPurify from "dompurify";
import Image from "next/image";
import Link from "next/link";

export default function PublicCareersPageClient({
  company,
}: {
  company: Company;
}) {
  const params = useParams();
  const slug = params["slug"] as string;

  const [locations, setLocations] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const workModes = ["all", "Remote", "Hybrid", "Onsite"];
  const [workModeFilter, setWorkModeFilter] = useState<
    "all" | "Remote" | "Hybrid" | "Onsite"
  >("all");
  const [sortFilter, setSortFilter] = useState<
    "highest" | "lowest" | "newest" | "oldest"
  >("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalDocs, setTotalDocs] = useState(1);
  const sortOptions = ["highest", "lowest", "newest", "oldest"];
  const itemsPerPage = 15;

  const handleClearFilters = () => {
    setWorkModeFilter("all");
    setLocationFilter("all");
    setSortFilter("newest");
    setCurrentPage(1);
    setSearchTerm("");
  };

  const fetchAllJobs = async () => {
    if (!company?.company_id) return;
    setLoading(true);
    try {
      const filters = {
        company_id: company.company_id,
        search: searchTerm || undefined,
        work_policy: workModeFilter !== "all" ? workModeFilter : undefined,
        location: locationFilter !== "all" ? locationFilter : undefined,
        sort_by: sortFilter || undefined,
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };

      const response: JobListResponse = await jobAPI.getAllJobs(filters);
      setJobs(response.result);
      setTotalDocs(response.metadata.totalCount);
      setLocations(response.metadata.locationArray);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllJobs();
  }, [slug, , workModeFilter, locationFilter, sortFilter, currentPage]);

  // debounce search term
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAllJobs();
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  if (!company) return notFound();

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: company.theme?.background_color }}
    >
      {/* Header */}
      {/* Header with Banner as Background */}
      <header
        className="relative flex items-center justify-center text-center border-b border-border/50"
        style={{
          backgroundImage: company.banner_url?.url
            ? `url(${process.env.NEXT_PUBLIC_S3_URL}/${company.banner_url.url})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "60vh",
        }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />

        {/* Content on top of the banner */}
        <div className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
          {company.logo_url?.url && (
            <div className="flex justify-center mb-6">
              <Link
                href={company.website || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-transform hover:scale-105"
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_S3_URL}/${company.logo_url.url}`}
                  alt={`${company.name} Logo`}
                  width={160}
                  height={160}
                  className="object-contain h-16 w-auto drop-shadow-md"
                  priority
                />
              </Link>
            </div>
          )}

          <h1
            className="text-5xl font-bold mb-4"
            style={{
              color: company.theme?.text_color || "#FFFFFF",
            }}
          >
            Join {company.name}
          </h1>

          <p
            className="text-lg leading-relaxed max-w-2xl mx-auto opacity-90"
            style={{
              color: company.theme?.text_color || "#F3F4F6",
            }}
          >
            {company.description}
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* About Section */}
        {company.sections &&
          company.sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <section
                key={section._id}
                className="mb-16 space-y-6"
                id={section.type.toLowerCase()}
              >
                <h2
                  className="text-3xl font-bold text-center md:text-left"
                  style={{
                    color: company.theme?.primary_color,
                  }}
                >
                  {section.title}
                </h2>

                {/* Safe Rich Text HTML Rendering */}
                <div
                  className="text-lg leading-relaxed"
                  style={{
                    color: company.theme?.text_color,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(section.content || ""),
                  }}
                />
              </section>
            ))}

        {/* Jobs Section */}

        <section>
          <div className="flex justify-between px-4">
            <h2
              className="text-3xl font-bold mb-8"
              style={{ color: company.theme?.primary_color }}
            >
              Open Positions
            </h2>

            {/* clear filters */}
            <button
              onClick={handleClearFilters}
              className="w-32 h-10 bg-red-500 cursor-pointer hover:bg-red-600 text-white rounded-md flex items-center justify-center"
            >
              Clear Filters
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <input
              type="text"
              placeholder="Search job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{
                backgroundColor: company.theme?.secondary_color,
                color: company.theme?.text_color,
              }}
            />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="input"
              style={{
                backgroundColor: company.theme?.secondary_color,
                color: company.theme?.text_color,
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
              onChange={(e) =>
                setWorkModeFilter(
                  e.target.value as "all" | "Remote" | "Hybrid" | "Onsite"
                )
              }
              className="input"
              style={{
                backgroundColor: company.theme?.secondary_color,
                color: company.theme?.text_color,
              }}
            >
              {workModes.map((mode) => (
                <option
                  key={mode}
                  value={mode as "all" | "Remote" | "Hybrid" | "Onsite"}
                >
                  {mode === "all" ? "All Work Modes" : mode}
                </option>
              ))}
            </select>
            {/* sort filter */}
            <select
              value={sortFilter}
              onChange={(e) =>
                setSortFilter(
                  e.target.value as "newest" | "oldest" | "highest" | "lowest"
                )
              }
              className="input"
              style={{
                backgroundColor: company.theme?.secondary_color,
                color: company.theme?.text_color,
              }}
            >
              <option disabled value="">
                Sort by
              </option>
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Job Cards */}
          {jobs.length > 0 && !loading ? (
            <>
              {" "}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div
                    key={job.job_id}
                    className="p-6 rounded-xl shadow-md hover:shadow-xl transition"
                    style={{
                      backgroundColor: company.theme?.secondary_color,
                      color: company.theme?.text_color,
                    }}
                  >
                    <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                    <p className="text-sm opacity-80 mb-4 line-clamp-3">
                      {job.description}
                    </p>
                    <div className="space-y-1 text-sm opacity-90 mb-4">
                      <p>📍 {job.location}</p>
                      <p>💼 {job.department}</p>
                      <p>🧠 {job.experience_level}</p>
                      <p>🏠 {job.work_policy}</p>
                    </div>

                    {/* Salary */}
                    {job.salary_type === "RANGE" && (
                      <p
                        className="font-semibold mb-4"
                        style={{ color: company.theme?.primary_color }}
                      >
                        ₹{job.min_salary?.toLocaleString()} - ₹
                        {job.max_salary?.toLocaleString()}{" "}
                        {job.currency || "INR"}
                      </p>
                    )}
                    {job.salary_type === "FIXED" && (
                      <p
                        className="font-semibold mb-4"
                        style={{ color: company.theme?.primary_color }}
                      >
                        ₹{job.salary_fixed?.toLocaleString()}{" "}
                        {job.currency || "INR"}
                      </p>
                    )}
                    {job.salary_type === "CONFIDENTIAL" && (
                      <p className="text-sm italic opacity-70">
                        Confidential Salary
                      </p>
                    )}

                    <button
                      className="mt-4 w-full py-2 rounded font-medium transition hover:opacity-90"
                      style={{
                        backgroundColor: company.theme?.primary_color,
                        color: company.theme?.text_color,
                      }}
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
              {jobs.length > 0 && (
                <div className="flex justify-between items-center mt-8">
                  {/* Page Info */}
                  <div className="text-muted-foreground text-sm">
                    Page {currentPage} of {Math.ceil(totalDocs / itemsPerPage)}
                  </div>

                  {/* Pagination Buttons */}
                  <div className="space-x-3">
                    {/* Previous */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg border transition-colors duration-200
          ${
            currentPage === 1
              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
              : "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent"
          }`}
                    >
                      ← Previous
                    </button>

                    {/* Next */}
                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={currentPage * itemsPerPage >= totalDocs}
                      className={`px-4 py-2 rounded-lg border transition-colors duration-200
          ${
            currentPage * itemsPerPage >= totalDocs
              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
              : "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent"
          }`}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              className="p-8 rounded-lg text-center"
              style={{
                backgroundColor: company.theme?.secondary_color,
                color: company.theme?.text_color,
              }}
            >
              {!loading && <p>No open positions at the moment.</p>}
              {loading && <p>Loading...</p>}
            </div>
          )}
        </section>
      </main>

      {/* Schema.org Metadata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: company.name,
            url: typeof window !== "undefined" ? window.location.href : "",
            jobPosting: jobs.map((job) => ({
              "@type": "JobPosting",
              title: job.title,
              description: job.description,
              employmentType: job.employment_type,
              datePosted: job.posted_at,
              jobLocation: {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: job.location,
                },
              },
              baseSalary:
                job.salary_type !== "CONFIDENTIAL"
                  ? {
                      "@type": "MonetaryAmount",
                      currency: job.currency || "INR",
                      value: {
                        "@type": "QuantitativeValue",
                        minValue: job.min_salary,
                        maxValue: job.max_salary,
                      },
                    }
                  : undefined,
            })),
          }),
        }}
      />
    </div>
  );
}
