"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { companyAPI } from "@/lib/api";
import { slugify } from "@/lib/utils";

export default function CreateCompanyPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // if (!user) {
  //   router.push("/login")
  //   return null
  // }

  useEffect(() => {
    console.log("user", user);

    if (!user) {
      console.log("user is null", user);

      router.push("/login");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const slug = slugify(companyName);
      const company = await companyAPI.create({
        name: companyName,
      });
      router.push(`/${slug}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Create Your Company</h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Company Name
            </label>
            <input
              id="name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input"
              placeholder="Your Company Name"
              required
            />
            <p className="text-sm text-text-secondary mt-2">
              Slug: {slugify(companyName) || "company-name"}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !companyName}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Company"}
          </button>
        </form>
      </main>
    </div>
  );
}
