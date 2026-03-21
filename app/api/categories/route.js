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
  const created = await createUserCategory(user.id, name);
  return NextResponse.json(created, { status: 201 });
}

