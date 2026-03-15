import type { NextConfig } from "next";

// Extract Supabase project reference from URL for CSP
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseProjectRef = supabaseUrl ? supabaseUrl.replace('https://', '').replace('.supabase.co', '') : '';
const supabaseWssUrl = supabaseProjectRef ? `wss://${supabaseProjectRef}.supabase.co` : '';
const supabaseHttpsUrl = supabaseProjectRef ? `https://${supabaseProjectRef}.supabase.co` : '';

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "no-referrer",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https: data: blob:",
      "media-src 'self' https: data: blob:",
      "font-src 'self' https: data:",
      `connect-src 'self' https: ${supabaseWssUrl} ${supabaseHttpsUrl}`,
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/:path*",
      headers: securityHeaders,
    },
  ],
};

export default nextConfig;
