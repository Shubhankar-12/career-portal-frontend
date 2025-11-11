import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = ["/", "/login", "/register"]
const protectedRoutes = ["/dashboard", "/create-company", "/jobs", "/company-slug"]

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get("token")?.value

  // Skip auth checks for public routes
  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next()
  }

  // Public careers pages accessible without auth
  if (pathname.includes("/careers")) {
    return NextResponse.next()
  }

  // Protected routes - require authentication
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
