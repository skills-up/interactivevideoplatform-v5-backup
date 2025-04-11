import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the token
  const token = await getToken({ req: request })

  // Check if the path is protected
  if (pathname.startsWith("/dashboard")) {
    // If not logged in, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url))
    }

    // Check if user has creator or admin role for dashboard access
    const userRole = token.role as string
    if (userRole !== "creator" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // Check for admin-only routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url))
    }

    const userRole = token.role as string
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/settings/:path*"],
}
