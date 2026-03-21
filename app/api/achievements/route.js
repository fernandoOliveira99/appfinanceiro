import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth-options";
import { getUserAchievementsWithProgress, checkAchievements } from "@lib/achievements";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  
  // Check achievements on dashboard load (or when this API is called)
  const newlyUnlocked = await checkAchievements(userId);
  const achievements = await getUserAchievementsWithProgress(userId);

  return NextResponse.json({ 
    achievements, 
    newlyUnlocked 
  });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const newlyUnlocked = await checkAchievements(userId);

  return NextResponse.json({ newlyUnlocked });
}
