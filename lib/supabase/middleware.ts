import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth")
  const isPublicRoute = request.nextUrl.pathname === "/"

  // Allow access to auth routes and public routes
  if (isAuthRoute || isPublicRoute) {
    return NextResponse.next()
  }

  // For now, allow all other routes - you can add auth logic later
  return NextResponse.next()
}
