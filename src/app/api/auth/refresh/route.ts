import { NextResponse } from "next/server";
import { getRefreshToken, verifyToken, setAuthCookies, clearAuthCookies } from "@/lib/auth";

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const payload = await verifyToken(refreshToken);
  if (!payload) {
    await clearAuthCookies();
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  await setAuthCookies({ userId: payload.userId, role: payload.role, email: payload.email });

  return NextResponse.json({ success: true });
}
