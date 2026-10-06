const nextConfig = {
  images: {
    unoptimized: false,
  },
  // pdfkit uses Node.js built-ins (fs, zlib, stream) — must NOT be bundled by Turbopack
  serverExternalPackages: ['pdfkit'],
};

export default nextConfig;
