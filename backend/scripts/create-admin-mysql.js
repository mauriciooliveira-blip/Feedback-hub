import mysql from "mysql2/promise";
import { env } from "../src/config/env.js";

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
  });

  try {
    const email = "admin@nefadv.com.br";
    const fullName = "Administrador";
    const cargo = "administrador";
    const setor = "Tecnologia";
    const tema = "claro";

    console.log("Criando usuário admin...");

    await connection.query(
      `INSERT INTO users (email, full_name, cargo, setor, tema, is_active)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         cargo = VALUES(cargo)`,
      [email, fullName, cargo, setor, tema, 1]
    );

    console.log("✅ Usuário admin criado com sucesso!");
    console.log(`Email: ${email}`);
    console.log(`Cargo: ${cargo}`);
    console.log(`Setor: ${setor}`);
    console.log(`\nNota: No frontend, basta usar o email para fazer login.`);
  } catch (error) {
    console.error("❌ Erro ao criar usuário admin:", error.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

createAdmin();
