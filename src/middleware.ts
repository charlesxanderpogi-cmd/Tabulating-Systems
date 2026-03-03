import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookies = req.cookies;

  if (pathname.startsWith("/admin")) {
    const admin = cookies.get("admin_username")?.value;
    if (!admin) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  if (pathname.startsWith("/judge")) {
    const judge = cookies.get("judge_username")?.value;
    if (!judge) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  if (pathname.startsWith("/tabulator")) {
    const tab = cookies.get("tabulator_username")?.value;
    if (!tab) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/judge/:path*", "/tabulator/:path*"],
};
