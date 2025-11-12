import { Metadata, ResolvingMetadata } from "next";
import PublicCareersPageClient from "./page.client.tsx";

import NotFound from "@/app/not-found.tsx";
import { cookies } from "next/headers";
import Script from "next/script";
interface Props {
  params: Promise<{
    slug: string;
  }>;
}
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const company = await fetchCompany(slug);
  if (!company || company.published !== "PUBLISHED") return {};

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";
  const companyUrl = `${baseUrl}/${company.slug}`;

  return {
    title: `${company.name} Careers | Join Our Team`,
    description:
      company.description ||
      `Explore career opportunities at ${company.name}. Join us and build the future together.`,
    keywords: [
      company.name,
      "careers",
      "jobs",
      "hiring",
      "recruitment",
      company.slug,
    ],
    openGraph: {
      title: `${company.name} Careers | Join Our Team`,
      description:
        company.description || `Explore exciting roles at ${company.name}.`,
      url: companyUrl,
      siteName: company.name,
      type: "website",
      images: [
        {
          url: company.banner_url?.url
            ? `${process.env.NEXT_PUBLIC_S3_URL}/${company.banner_url.url}`
            : `${baseUrl}/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: `${company.name} Careers Banner`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${company.name} Careers | Join Our Team`,
      description:
        company.description ||
        `Discover open positions and work with ${company.name}.`,
      images: [
        company.banner_url?.url
          ? `${process.env.NEXT_PUBLIC_S3_URL}/${company.banner_url.url}`
          : `${baseUrl}/og-default.jpg`,
      ],
    },
    alternates: {
      canonical: companyUrl,
    },
    other: {
      "og:type": "website",
      "og:locale": "en_US",
    },
  };
}

const fetchCompany = async (slug: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/company/?slug=${slug}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // next headers
          Authorization: `Bearer ${token}`,
        },
        // Ensures Next.js fetch caching doesn’t interfere (always fresh)
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error("Failed to fetch company:", res.statusText);
      return null;
    }

    const comp = await res.json();

    if (!comp || comp.published !== "PUBLISHED") {
      return null;
    }

    return comp;
  } catch (error) {
    console.error("Error fetching company:", error);
    return null;
  }
};

export default async function PublicCareersPage({ params }: Props) {
  const { slug } = await params;

  const company = await fetchCompany(slug);
  if (!company) return <NotFound />;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: `${baseUrl}/${company.slug}`,
    logo: company.logo_url?.url
      ? `${process.env.NEXT_PUBLIC_S3_URL}/${company.logo_url.url}`
      : `${baseUrl}/logo.png`,
    description:
      company.description ||
      `Explore exciting career opportunities at ${company.name}.`,
    sameAs: [
      company.website || `${baseUrl}`,
      company.linkedin_url || "",
      company.twitter_url || "",
    ].filter(Boolean),
  };

  return (
    <>
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicCareersPageClient company={company} />
    </>
  );
}
