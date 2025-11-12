"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  companyAPI,
  jobAPI,
  JobListResponse,
  type Company,
  type Job,
} from "@/lib/api";
import { AuthGuard } from "@/components/shared/auth-guard";
import { getS3Url } from "@/lib/utils";
import DOMPurify from "dompurify";
import Image from "next/image";

function PreviewContent() {
  const params = useParams();
  const slug = params["slug"] as string;
  const user = useAuthStore((state) => state.user);
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const fetchAllJobs = async (company_id: string) => {
    try {
      setLoading(true);

      const filters = {
        company_id: company_id,
        sort_by: "newest",
      };

      const response: JobListResponse = await jobAPI.getAllJobs(filters);
      setJobs(response.result);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompany = async () => {
    setLoading(true);

    try {
      const comp = await companyAPI.getBySlug(slug);
      if (!comp) return;
      if (user && comp.user_id !== user.user_id) return;
      setCompany(comp);

      await fetchAllJobs(comp.company_id);
    } catch (err) {
      console.error("Error fetching company:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompany();
  }, [slug, user]);

  const handlePublish = async () => {
    if (!company) return;
    setPublishing(true);
    try {
      const updatedCompany = await companyAPI.update(company.company_id, {
        published: company.published === "DRAFT" ? "PUBLISHED" : "DRAFT",
      });
      if (updatedCompany) setCompany(updatedCompany);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!company) return null;
  if (user && company.user_id !== user.user_id) return null;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: company?.theme?.background_color }}
    >
      {/* Recruiter Sticky Bar */}
      {user && company.user_id === user.user_id && (
        <div className="border-b border-border/50 py-3 px-6 bg-background/90 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link
              href={`/${slug}/edit`}
              className="text-accent hover:underline text-sm"
            >
              ← Back to Editor
            </Link>
            <div className="space-x-4">
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="text-sm px-3 py-1 bg-secondary/50 rounded hover:bg-secondary/70 disabled:opacity-50"
              >
                {company.published === "PUBLISHED" ? "Unpublish" : "Publish"}
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

      {/* ---------- Header with Banner & Logo ---------- */}
      <header className="relative w-full mb-16">
        {/* Banner Image */}
        {company.banner_url?.url && (
          <div className="h-64 md:h-80 w-full overflow-hidden relative">
            <Image
              src={getS3Url(company.banner_url.url)}
              alt={`${company.name} banner`}
              className="w-full h-full object-cover"
              width={200}
              height={200}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        {/* Logo Overlay */}
        {company.logo_url?.url && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg">
            <Link
              href={company.website || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-transform hover:scale-105"
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
      </header>

      {/* ---------- Career Page Content ---------- */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* 🧩 Render Sections Dynamically by Order */}
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

        {/* 🧱 Jobs Section */}
        <section id="jobs">
          <h2
            className="text-3xl font-bold mb-8"
            style={{ color: company?.theme?.primary_color }}
          >
            Open Positions
          </h2>

          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {jobs.map((job) => (
                <div
                  key={job.job_id}
                  className="rounded-2xl shadow-md hover:shadow-lg border border-border p-6 transition-all duration-200 hover:-translate-y-1"
                  style={{
                    backgroundColor:
                      company?.theme?.secondary_color || "#1f2937",
                    color: company?.theme?.text_color || "#fff",
                  }}
                >
                  {/* Job Title */}
                  <h3 className="text-xl font-bold mb-3 line-clamp-1">
                    {job.title}
                  </h3>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-3 text-sm opacity-80 mb-3">
                    {job.location && (
                      <span className="bg-background/20 px-2 py-1 rounded-md">
                        📍 {job.location}
                      </span>
                    )}
                    {job.work_policy && (
                      <span className="bg-background/20 px-2 py-1 rounded-md">
                        💼 {job.work_policy}
                      </span>
                    )}
                    {job.department && (
                      <span className="bg-background/20 px-2 py-1 rounded-md">
                        🏢 {job.department}
                      </span>
                    )}
                  </div>

                  {/* Salary Section */}
                  <div className="mt-3">
                    {job.salary_type === "RANGE" && (
                      <p className="text-base font-semibold">
                        💰 {job.min_salary?.toLocaleString()} -{" "}
                        {job.max_salary?.toLocaleString()}{" "}
                        {job.currency || "INR"}
                      </p>
                    )}
                    {job.salary_type === "FIXED" && (
                      <p className="text-base font-semibold">
                        💰 {job.salary_fixed?.toLocaleString()}{" "}
                        {job.currency || "INR"}
                      </p>
                    )}
                    {job.salary_type === "CONFIDENTIAL" && (
                      <p className="text-sm italic opacity-70">
                        💰 Confidential Salary
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex justify-between items-center text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.status === "OPEN"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-gray-500/20 text-gray-300"
                      }`}
                    >
                      {job.status}
                    </span>

                    <Link
                      href={`/jobs/${job.job_id}/edit`}
                      className="text-primary font-medium hover:underline"
                      style={{ color: company?.theme?.primary_color }}
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No open positions at the moment.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <AuthGuard>
      <PreviewContent />
    </AuthGuard>
  );
}
