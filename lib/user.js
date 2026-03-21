import { query } from "./db";

export async function updateUserAvatar(userId, avatarDataUrl) {
  const res = await query(
    `UPDATE users
        SET avatar = $1
      WHERE id = $2
    RETURNING id, name, email, avatar, created_at`,
    [avatarDataUrl, userId]
  );
  return res.rows[0];
}

