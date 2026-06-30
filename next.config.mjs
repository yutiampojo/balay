/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
