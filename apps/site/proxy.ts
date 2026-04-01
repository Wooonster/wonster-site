import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (request.headers.get("host") === "www.whatsmy.fun") {
    return NextResponse.redirect(new URL("https://whatsmy.fun"), 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*"
};

