import { Company } from "@/lib/api";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

  // Fetch all published companies
  const companiesRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/company/list?published=true`
  );
  const companiesResp = await companiesRes.json();
  const companies: Company[] = companiesResp.result || [];

  // Fetch all published jobs

  // Static routes
  const routes = [
    "",
    "/login",
    "/register",
    "/dashboard",
    "/jobs/new",
    "/create-company",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  // Company career pages
  const companyPages = companies?.map((company) => ({
    url: `${baseUrl}/${company.slug}/careers`,
    lastModified: company.updated_at || new Date(),
  }));

  return [...routes, ...companyPages];
}
