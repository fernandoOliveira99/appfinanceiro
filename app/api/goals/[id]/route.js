import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { query } from "@lib/db";
import { checkAchievements } from "@lib/achievements";

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  const { id } = params;

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, target_amount, current_amount, deadline } = body;

    let updateQuery = "UPDATE goals SET ";
    let paramsArr = [];
    let paramIndex = 1;

    if (type !== undefined) {
      updateQuery += `type = $${paramIndex++}, `;
      paramsArr.push(type);
    }
    if (target_amount !== undefined) {
      updateQuery += `target_amount = $${paramIndex++}, `;
      paramsArr.push(Number(target_amount));
    }
    if (current_amount !== undefined) {
      updateQuery += `current_amount = $${paramIndex++}, `;
      paramsArr.push(Number(current_amount));
    }
    if (deadline !== undefined) {
      updateQuery += `deadline = $${paramIndex++}, `;
      paramsArr.push(deadline);
    }

    // Remove last comma and space
    updateQuery = updateQuery.slice(0, -2);
    updateQuery += ` WHERE id = $${paramIndex++} AND user_id = $${paramIndex++} RETURNING *`;
    paramsArr.push(id, user.id);

    const res = await query(updateQuery, paramsArr);

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Meta não encontrada." }, { status: 404 });
    }

    // Check achievements after a goal update
    const newlyUnlocked = await checkAchievements(user.id);

    return NextResponse.json({ ...res.rows[0], newlyUnlocked });
  } catch (error) {
    console.error("Failed to update goal:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  const { id } = params;

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await query("DELETE FROM goals WHERE id = $1 AND user_id = $2", [id, user.id]);

  return NextResponse.json({ success: true });
}
