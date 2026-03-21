import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { renameUserCategory, deleteUserCategory } from "@lib/categories";

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const id = params.id;
  const body = await request.json();
  const { name } = body;
  if (!name) {
    return NextResponse.json(
      { error: "Informe o novo nome." },
      { status: 400 }
    );
  }
  const updated = await renameUserCategory(user.id, id, name);
  return NextResponse.json(updated);
}

export async function DELETE(_request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const id = params.id;
  await deleteUserCategory(user.id, id);
  return NextResponse.json({ ok: true });
}

