/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  //output: "standalone", // Use this flag to ensure successful deployments to Azure App Service.
  env: {
    // Next.js has a known issue: during production builds in "standalone" mode, it does not export server-side variables from .env.local.
    // To resolve this, you should use .env or .env.production for standalone builds.
    // // Alternatively, you can declare server-side variables from .env.local as exportable ones in next.config.mjs, as shown below.
    SERVER_ONLY_restApiKeys: process.env.SERVER_ONLY_restApiKeys,
    pagecachetimeout: process.env.pagecachetimeout,
  },
};

export default nextConfig;
