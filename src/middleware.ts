import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const AUTH_REQUIRED_PATHS = ["/mypage", "/skills/upload"];
const ADMIN_REQUIRED_PATHS = ["/admin"];

function isProtectedPath(pathname: string, paths: string[]) {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const requiresAuth = isProtectedPath(pathname, AUTH_REQUIRED_PATHS);
  const requiresAdmin = isProtectedPath(pathname, ADMIN_REQUIRED_PATHS);

  if ((requiresAuth || requiresAdmin) && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (requiresAdmin && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
