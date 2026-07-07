/** @type {import('next').NextConfig} */
// Content Security Policy. script/style use 'unsafe-inline' because Next.js
// injects inline bootstrap scripts and the app uses inline styles; the rest is
// locked down (no framing, no arbitrary connect targets, restricted objects).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    // Old static .html URLs → new live routes
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/login.html", destination: "/login", permanent: true },
      { source: "/signup.html", destination: "/signup", permanent: true },
      { source: "/dashboard.html", destination: "/dashboard", permanent: true },
      { source: "/listing.html", destination: "/rentals", permanent: true },
      { source: "/messages.html", destination: "/messages", permanent: true },
      { source: "/keyholder.html", destination: "/keyholder", permanent: true },
      { source: "/create-listing.html", destination: "/owner/listings/new", permanent: true },
      { source: "/owner.html", destination: "/owner", permanent: true },
      { source: "/admin.html", destination: "/admin", permanent: true },
      { source: "/apply.html", destination: "/rentals", permanent: true },
    ];
  },
};

export default nextConfig;
