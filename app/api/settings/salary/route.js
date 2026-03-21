import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { getUserSettings, upsertUserSalary } from "@lib/categories";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const settings = await getUserSettings(user.id);
  return NextResponse.json(settings);
}

export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const body = await request.json();
  const { salary } = body;
  const value = Number(salary) || 0;
  const updated = await upsertUserSalary(user.id, value);
  return NextResponse.json(updated);
}

