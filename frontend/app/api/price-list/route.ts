// app/api/price-list/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";
import { getToken } from "next-auth/jwt";

// این Route به Node runtime نیاز دارد (نه Edge)
export const runtime = "nodejs";
// برای اطمینان از بی‌کش بودن
export const dynamic = "force-dynamic";

function bearer(h?: string | null) {
  if (!h) return undefined;
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m?.[1];
}

export async function GET(req: NextRequest) {
  // 1) خواندن سشن
  const session = await getServerSession(authOptions).catch(() => null);
  // برخی پروژه‌ها token را در session.user.accessToken می‌گذارند
  let accessToken = (session as any)?.user?.accessToken as string | undefined;

  // 2) اگر نبود، از JWT کوکی NextAuth بخوان (نزدیک‌ترین به منبع حقیقت)
  if (!accessToken) {
    const jwt = await getToken({ req, raw: false }).catch(() => null);
    // بسته به callbacks، ممکن است jwt?.accessToken یا jwt?.token یا ... باشد
    accessToken =
      (jwt as any)?.accessToken ||
      (jwt as any)?.token ||
      (jwt as any)?.access_token ||
      undefined;
  }

  // 3) اگر هنوز نبود، از هدر ورودی (در صورت موجود) بگیر
  if (!accessToken) {
    accessToken = bearer(req.headers.get("authorization"));
  }

  // 4) ساخت URL مقصد
  const goBase = (process.env.INTERNAL_GO_API_URL || "").replace(/\/+$/, "");
  if (!goBase) {
    return new NextResponse("INTERNAL_GO_API_URL is not set", { status: 500 });
  }
  const incomingUrl = new URL(req.url);
  const query = incomingUrl.search || "";
  const goUrl = `${goBase}/user-product/fetch-price-list-pdf`;

  // 5) هدرها را بسازیم
  const headers: Record<string, string> = {
    // برای فایل بهتره کش نکنیم
    "Accept": "application/pdf",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // 🔁 پاس‌دادن کوکی‌های کلاینت به Go به‌عنوان fallback
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    headers["Cookie"] = cookieHeader;
  }

  // (اختیاری) پاس‌دادن زبان/آی‌پی
  const lang = req.headers.get("accept-language");
  if (lang) headers["Accept-Language"] = lang;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) headers["X-Forwarded-For"] = xff;

  // 6) درخواست به Go
  const goRes = await fetch(goUrl, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!goRes.ok) {
    const bodyText = await goRes.text().catch(() => "");
    // اگر 401 شد، پیام راهنما بدهیم
    if (goRes.status === 401) {
      return new NextResponse(
        bodyText || "Unauthorized from upstream. No valid token/cookies reached Go.",
        { status: 401 }
      );
    }
    return new NextResponse(bodyText || "Upstream error", { status: goRes.status });
  }

  // 7) استریم پاسخ
  const contentType = goRes.headers.get("Content-Type") ?? "application/pdf";
  const contentDisp =
    goRes.headers.get("Content-Disposition") ??
    `attachment; filename="price-list.pdf"`;
  const contentLength = goRes.headers.get("Content-Length") ?? undefined;

  const body = goRes.body;
  if (!body) {
    const buf = await goRes.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisp,
        ...(contentLength ? { "Content-Length": contentLength } : {}),
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
      },
    });
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisp,
      ...(contentLength ? { "Content-Length": contentLength } : {}),
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    },
  });
}
