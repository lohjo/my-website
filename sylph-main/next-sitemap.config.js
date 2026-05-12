/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000",
  generateRobotsTxt: true,
};
