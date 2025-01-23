import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("userAccessToken");

  //   const protectedPaths = ['/']
  //   if (protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
  //     if (!token) {
  //       return NextResponse.redirect(new URL('/auth/login', request.url))
  //     }
  //   }

  return NextResponse.next();
}
