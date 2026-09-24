import { NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendPushNotification } from "@/lib/push";
import { sendEmail } from "@/lib/mail";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, body, url } = await request.json();
    if (!title || !body) {
      return NextResponse.json({ error: "Title and body required" }, { status: 400 });
    }

    const subs = await db.select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user.userId));

    const results = await Promise.allSettled(
      subs.map((s) => {
        const sub = JSON.parse(s.subscription);
        return sendPushNotification(sub, { title, body, url });
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await sendEmail({
      to: user.email,
      subject: title,
      text: `${body}\n\n${url ? `Open: ${url}` : `Open the app: ${appUrl}`}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#111827;margin-bottom:8px;">${title}</h2>
          <p style="color:#374151;line-height:1.6;">${body}</p>
          ${url ? `<p><a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Open</a></p>` : ""}
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Sent by ${process.env.BREVO_FROM_NAME || "APTPA"}</p>
        </div>`,
    });

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error("Push send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
