import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Public routes
  if (pathname === "/login") return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    // Admin-only
    if (pathname.startsWith("/admin") && user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Redirect logged-in users away from login
    if (pathname === "/login") {
      return NextResponse.redirect(
        new URL(user.role === "admin" ? "/admin" : "/dashboard", req.url)
      );
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login"]
};
