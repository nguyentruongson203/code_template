import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/shared/"],
    },
    sitemap: "https://codeplayground.dev/sitemap.xml",
  }
}
