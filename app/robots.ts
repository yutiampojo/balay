import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private/authenticated areas out of search results.
      disallow: ["/admin", "/dashboard", "/owner", "/messages", "/profile", "/saved", "/auth/", "/api/", "/reset-password", "/forgot-password"],
    },
    sitemap: "https://balaymo.com/sitemap.xml",
    host: "https://balaymo.com",
  };
}
