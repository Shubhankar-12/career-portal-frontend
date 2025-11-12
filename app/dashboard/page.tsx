"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  companyAPI,
  Job,
  jobAPI,
  type Company,
  type JobListResponse,
} from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { AuthGuard } from "@/components/shared/auth-guard";

function DashboardContent() {
  const router = useRouter();
  const user = authUtils.getUser();
  const currentCompany = authUtils.getCompany();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jonMeta, setJobMeta] = useState<{
    totalCount: number;
    openJobs: number;
    closedJobs: number;
  }>({
    totalCount: 0,
    openJobs: 0,
    closedJobs: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("currentCompany", currentCompany);

      // ✅ Fetch company details
      const comp = await companyAPI.getById(currentCompany?.company_id!);
      setCompany(comp);

      // ✅ Fetch all jobs for that company
      const jobResponse: JobListResponse = await jobAPI.getAllJobs({
        company_id: currentCompany?.company_id!,
      });

      setJobs(jobResponse.result || []);

      setJobMeta(jobResponse.metadata);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const [publishing, setPublishing] = useState(false);
  const handlePublish = async () => {
    if (!company) return;
    setPublishing(true);
    try {
      const updatedCompany = await companyAPI.update(company.company_id, {
        published: company.published === "DRAFT" ? "PUBLISHED" : "DRAFT",
      });
      if (updatedCompany)
        setCompany((prev) => {
          return prev ? { ...prev, published: updatedCompany.published } : null;
        });
    } finally {
      setPublishing(false);
    }
  };

  const handleSignOut = () => {
    authUtils.logout();
    useAuthStore.setState({ user: null, token: null });
    router.push("/login");
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-border py-4 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p
              onClick={handleSignOut}
              className="text-text-secondary hover:text-primary cursor-pointer"
            >
              Sign Out
            </p>
          </div>
        </header>
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Company not created yet</h2>
            <p className="text-text-secondary">
              Create your company to get started.
            </p>
            <Link href="/create-company" className="btn-primary inline-block">
              Create Company
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="space-x-4">
            <span className="text-text-secondary">{user?.name}</span>
            <button
              onClick={handleSignOut}
              className="text-red-600 hover:text-red-500 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Summary Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">User</p>
              <h3 className="text-xl font-bold">{user?.name}</h3>
            </div>
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Company</p>
              <h3 className="text-xl font-bold">{company.name}</h3>
            </div>
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Status</p>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {company.published === "PUBLISHED" ? (
                    <span className="text-green-400">Published</span>
                  ) : (
                    <span className="text-yellow-400">Draft</span>
                  )}
                </h3>

                <button
                  onClick={handlePublish}
                  className={`ml-2 px-3 py-1.5 text-sm rounded-full font-medium transition-all cursor-pointer
        ${
          company.published === "PUBLISHED"
            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
            : "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
        }`}
                >
                  {company.published === "PUBLISHED" ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>

            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Active Jobs</p>
              <h3 className="text-xl font-bold">{jonMeta.openJobs}</h3>
            </div>
          </div>

          {/* Job Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Active Jobs</p>
              <h3 className="text-3xl font-bold">{jonMeta.openJobs}</h3>
            </div>
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Closed Jobs</p>
              <h3 className="text-3xl font-bold">{jonMeta.closedJobs}</h3>
            </div>
            <div className="card">
              <p className="text-text-secondary text-sm mb-1">Total Jobs</p>
              <h3 className="text-3xl font-bold">{jonMeta.totalCount}</h3>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href={`/${company.slug}/edit`}
                className="card hover:bg-secondary/50 transition cursor-pointer"
              >
                <h3 className="font-bold mb-2">Edit Company</h3>
                <p className="text-text-secondary text-sm">
                  Update theme, sections, and media
                </p>
              </Link>
              <Link
                href="/jobs"
                className="card hover:bg-secondary/50 transition cursor-pointer"
              >
                <h3 className="font-bold mb-2">Manage Jobs</h3>
                <p className="text-text-secondary text-sm">
                  View, create, and edit positions
                </p>
              </Link>
              <Link
                href={`/${company.slug}/careers`}
                target="_blank"
                className="card hover:bg-secondary/50 transition cursor-pointer"
              >
                <h3 className="font-bold mb-2">View Career Page</h3>
                <p className="text-text-secondary text-sm">
                  See public careers page
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
