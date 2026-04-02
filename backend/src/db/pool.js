import mysql from "mysql2/promise";
import { env } from "../config/env.js";

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: 12,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

export { pool };

export async function dbQuery(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

