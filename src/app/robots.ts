import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/contact", "/demo", "/privacy", "/ndpr", "/terms", "/register-facility"],
        disallow: ["/api/", "/admin/", "/dashboard/", "/discharge/", "/audit/", "/settings/", "/facility/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
