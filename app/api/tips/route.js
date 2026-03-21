import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth-options";
import { generateSmartTips } from "@lib/tips";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const tips = await generateSmartTips(userId);

  return NextResponse.json({ tips });
}
