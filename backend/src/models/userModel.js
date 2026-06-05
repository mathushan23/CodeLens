import { query } from "./db.js";

export const findUserById = async (id) => {
  const rows = await query(
    `SELECT
      id,
      github_id AS githubId,
      username,
      email,
      avatar_url AS avatarUrl,
      created_at AS createdAt
    FROM users
    WHERE id = ?
    LIMIT 1`,
    [Number(id)],
  );

  return rows[0] ?? null;
};

export const upsertGithubUser = async (profile) => {
  const githubId = profile.id?.toString();
  const email = profile.emails?.[0]?.value;
  const username = profile.username || profile.displayName || "";
  const avatarUrl = profile.photos?.[0]?.value || null;

  await query(
    `INSERT INTO users (github_id, username, email, avatar_url)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       username = VALUES(username),
       email = VALUES(email),
       avatar_url = VALUES(avatar_url)`,
    [githubId, username, email ?? null, avatarUrl],
  );

  const rows = await query(
    `SELECT
      id,
      github_id AS githubId,
      username,
      email,
      avatar_url AS avatarUrl,
      created_at AS createdAt
    FROM users
    WHERE github_id = ?
    LIMIT 1`,
    [githubId],
  );

  return rows[0] ?? null;
};
