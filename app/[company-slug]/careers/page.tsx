import PublicCareersPageClient from "./page.client.tsx"
import { companyAPI } from "@/lib/api"

export async function generateMetadata({ params }: { params: { "company-slug": string } }) {
  const company = await companyAPI.getBySlug(params["company-slug"])
  if (!company || !company.published) return {}

  return {
    title: `${company.name} - Careers`,
    description: `Join ${company.name}. Explore open positions and join our team.`,
    openGraph: {
      title: `${company.name} - Careers`,
      description: `Join ${company.name}. Explore open positions and join our team.`,
    },
  }
}

export default function PublicCareersPage() {
  return <PublicCareersPageClient />
}
