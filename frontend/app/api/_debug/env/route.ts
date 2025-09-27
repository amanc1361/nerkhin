// app/api/_debug/env/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    NEXTAUTH_COOKIE_DOMAIN: process.env.NEXTAUTH_COOKIE_DOMAIN || null,
    NODE_ENV: process.env.NODE_ENV || null,
  });
}
