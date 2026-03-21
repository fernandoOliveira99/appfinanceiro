// BUSINESS LOGIC: categorias e preferências de usuário no banco.
import "server-only";
import { query } from "./db";

const DEFAULT_EXPENSE_CATEGORIES = [
  "Moradia",
  "Aluguel",
  "Supermercado",
  "Transporte",
  "Lazer",
  "Saúde",
  "Educação",
  "Investimentos",
  "Outros"
];

const DEFAULT_INCOME_CATEGORIES = [
  "Salário",
  "Freelance",
  "Investimentos",
  "Outros"
];

export async function getUserSettings(userId) {
  const res = await query(
    `SELECT salary
       FROM user_settings
      WHERE user_id = $1`,
    [userId]
  );
  const row = res.rows[0];
  return {
    salary: row?.salary ?? 0
  };
}

export async function upsertUserSalary(userId, salary) {
  const res = await query(
    `INSERT INTO user_settings (user_id, salary)
         VALUES ($1, $2)
    ON CONFLICT (user_id)
      DO UPDATE SET salary = EXCLUDED.salary
    RETURNING user_id, salary`,
    [userId, salary]
  );
  return res.rows[0];
}

export async function listUserCategories(userId) {
  const res = await query(
    `SELECT id, name
       FROM categories
      WHERE user_id = $1
      ORDER BY name ASC`,
    [userId]
  );
  const rows = res.rows;
  if (rows.length > 0) return rows;

  // Seed categorias padrão para este usuário se ele ainda não tiver nenhuma.
  const allDefaults = [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...DEFAULT_INCOME_CATEGORIES
  ];
  const values = allDefaults.map((name) => `('${userId}', '${name.replace("'", "''")}')`).join(", ");
  await query(
    `INSERT INTO categories (user_id, name)
       VALUES ${values}
       ON CONFLICT (user_id, name) DO NOTHING`
  );

  const seeded = await query(
    `SELECT id, name
       FROM categories
      WHERE user_id = $1
      ORDER BY name ASC`,
    [userId]
  );
  return seeded.rows;
}

export async function createUserCategory(userId, name) {
  const res = await query(
    `INSERT INTO categories (user_id, name)
         VALUES ($1, $2)
    RETURNING id, user_id, name`,
    [userId, name]
  );
  return res.rows[0];
}

export async function renameUserCategory(userId, id, newName) {
  const res = await query(
    `UPDATE categories
        SET name = $1
      WHERE id = $2
        AND user_id = $3
    RETURNING id, user_id, name`,
    [newName, id, userId]
  );
  return res.rows[0];
}

export async function deleteUserCategory(userId, id) {
  await query("DELETE FROM categories WHERE id = $1 AND user_id = $2", [
    id,
    userId
  ]);
}

