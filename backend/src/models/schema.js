import { query } from "./db.js";

export const initializeSchema = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      github_id VARCHAR(255) NOT NULL UNIQUE,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) NULL,
      avatar_url TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      pr_url TEXT NOT NULL,
      repo_name VARCHAR(255) NOT NULL,
      pr_number INT NOT NULL,
      pr_title VARCHAR(255) NOT NULL,
      branch_from VARCHAR(255) NOT NULL,
      branch_to VARCHAR(255) NOT NULL,
      score INT NOT NULL DEFAULT 0,
      summary TEXT NOT NULL,
      files_reviewed INT NOT NULL DEFAULT 0,
      lines_added INT NOT NULL DEFAULT 0,
      lines_removed INT NOT NULL DEFAULT 0,
      status ENUM('PENDING', 'PROCESSING', 'DONE', 'FAILED') NOT NULL DEFAULT 'PENDING',
      raw_response JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS issues (
      id INT AUTO_INCREMENT PRIMARY KEY,
      review_id INT NOT NULL,
      type ENUM('SECURITY', 'BUG', 'COMPLEXITY', 'STYLE') NOT NULL,
      severity ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL,
      title VARCHAR(255) NOT NULL,
      file_path VARCHAR(255) NOT NULL,
      line_number INT NOT NULL,
      description TEXT NOT NULL,
      suggestion TEXT NOT NULL,
      is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_issues_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
    )
  `);
};
