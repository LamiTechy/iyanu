import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-do-not-use-in-prod");

const publicPaths = ["/login", "/register", "/api/auth/login", "/api/auth/register"];

const isPublicStaticAsset = (pathname: string) => {
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/icons/") || pathname === "/manifest.json" || pathname === "/sw.js") return true;
  return /\.(png|jpe?g|gif|svg|webp|ico|avif|bmp|css|js|map|woff2?|ttf|eot)$/.test(pathname);
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((p) => pathname.startsWith(p)) || pathname === "/" || isPublicStaticAsset(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/cron/")) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.userId));
    requestHeaders.set("x-user-role", String(payload.role));
    requestHeaders.set("x-user-email", String(payload.email));

    if (pathname.startsWith("/lecturer") && payload.role !== "lecturer" && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/student") && payload.role !== "student" && payload.role !== "admin") {
      if (payload.role === "lecturer") {
        return NextResponse.redirect(new URL("/lecturer/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/api/admin") && payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (pathname.startsWith("/api/assignments") && request.method === "POST" && payload.role !== "lecturer" && payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js).*)"],
};