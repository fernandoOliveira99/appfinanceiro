import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import {
  listUserCategories,
  createUserCategory
} from "@lib/categories";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const categories = await listUserCategories(user.id);
  return NextResponse.json(categories);
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const body = await request.json();
  const { name } = body;
  if (!name) {
    return NextResponse.json(
      { error: "Informe o nome da categoria." },
      { status: 400 }
    );
  }
  try {
    const created = await createUserCategory(user.id, name);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    // Código 23505 é erro de unicidade (categoria já existe para este usuário)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: "Esta categoria já existe." },
        { status: 409 }
      );
    }
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar categoria." },
      { status: 500 }
    );
  }
}

