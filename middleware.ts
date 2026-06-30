import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_GATE_COOKIE,
  adminGateToken,
  gateCookieOptions,
  getAdminAccessSecret,
  hasValidGateCookie,
  isValidAccessKey
} from "@/lib/admin-gate";

function notFound() {
  return new NextResponse(null, { status: 404 });
}

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function middleware(request: NextRequest) {
  const secret = getAdminAccessSecret();
  if (!secret || !hasSupabaseEnv()) {
    return notFound();
  }

  const accessKey = request.nextUrl.searchParams.get("access");
  if (isValidAccessKey(accessKey)) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("access");
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(ADMIN_GATE_COOKIE, await adminGateToken(secret), gateCookieOptions());
    return response;
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role === "admin") {
      return response;
    }
    return notFound();
  }

  const gateCookie = request.cookies.get(ADMIN_GATE_COOKIE)?.value;
  if (await hasValidGateCookie(gateCookie)) {
    return response;
  }

  return notFound();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"]
};
