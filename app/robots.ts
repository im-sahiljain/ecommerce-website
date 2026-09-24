import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/checkout", "/account"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
