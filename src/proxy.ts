import { NextResponse, NextRequest } from "next/server";
import { getSessionCookieName, getSessionSecret, verifySessionToken } from "@/lib/session";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookies = req.cookies;

  const cookieName = getSessionCookieName();
  const token = cookies.get(cookieName)?.value ?? null;
  let session = null;
  if (token) {
    try {
      session = await verifySessionToken(token, getSessionSecret());
    } catch {
      session = null;
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  if (pathname.startsWith("/judge")) {
    if (!session || session.role !== "judge") {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  if (pathname.startsWith("/tabulator")) {
    if (!session || session.role !== "tabulator") {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/judge/:path*", "/tabulator/:path*"],
};
