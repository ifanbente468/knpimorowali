import { NextResponse, type NextRequest } from "next/server";
import { isInstalledSync } from "@/lib/install-state";

const ALWAYS_ALLOWED = [
  /^\/install(?:\/.*)?$/,
  /^\/api(?:\/.*)?$/,
  /^\/_next(?:\/.*)?$/,
  /^\/uploads(?:\/.*)?$/,
  /^\/images(?:\/.*)?$/,
  /^\/fonts(?:\/.*)?$/,
  /^\/(?:favicon\.ico|icon\.jpg|robots\.txt|manifest\.webmanifest)$/,
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ALWAYS_ALLOWED.some((pattern) => pattern.test(pathname))) {
    return NextResponse.next();
  }

  if (isInstalledSync()) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/install";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
