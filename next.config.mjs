/** @type {import('next').NextConfig} */
const nextConfig = {
  // The /api/chat route handler uses socket.io-client (Node) to reach the
  // backend. Keep it out of the webpack bundle so it resolves to the Node build
  // at runtime instead of the browser build (which never connects under Node).
  experimental: {
    serverComponentsExternalPackages: ["socket.io-client"],
  },
};

export default nextConfig;
