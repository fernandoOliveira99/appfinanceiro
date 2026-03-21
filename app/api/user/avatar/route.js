import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { updateUserAvatar } from "@lib/user";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json();
  const { avatar } = body;

  if (!avatar) {
    return NextResponse.json(
      { error: "Envie uma imagem em formato data URL." },
      { status: 400 }
    );
  }

  const updated = await updateUserAvatar(user.id, avatar);
  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    avatar: updated.avatar
  });
}

