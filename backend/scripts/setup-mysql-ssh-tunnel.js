import { spawn } from "child_process";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setupMySQLWithSSHTunnel() {
  console.log("Iniciando SSH tunnel para MySQL...\n");

  // Criar SSH tunnel
  const sshProcess = spawn("ssh", [
    "-L",
    "3306:localhost:3306",
    "root@129.121.55.207",
    "-p",
    "22022",
    "-N",
  ]);

  sshProcess.stderr.on("data", (data) => {
    console.error(`SSH Error: ${data}`);
  });

  // Aguardar tunnel estar pronto
  await new Promise((resolve) => setTimeout(resolve, 2000));

  let appConnection;
  try {
    console.log("Conectando ao MySQL através do tunnel SSH...\n");

    appConnection = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "Vps@nef10",
    });

    // Criar banco de dados
    console.log("1️⃣ Criando banco de dados feedback_hub...");
    try {
      await appConnection.query(`
        CREATE DATABASE IF NOT EXISTS feedback_hub
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci;
      `);
      console.log("   ✅ Banco criado/verificado");
    } catch (err) {
      console.log("   ✅ Banco já existe");
    }

    // Conectar ao banco feedback_hub
    await appConnection.end();
    appConnection = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "Vps@nef10",
      database: "feedback_hub",
    });

    // Criar tabelas
    console.log("\n2️⃣ Criando tabelas...");
    const sqlPath = path.join(__dirname, "../database/migrations/mysql/001_create_schema.up.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    const statements = sql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--") && !stmt.startsWith("USE"));

    for (const statement of statements) {
      try {
        await appConnection.query(statement);
      } catch (err) {
        if (!err.message.includes("already exists")) {
          console.error("Erro:", err.message);
        }
      }
    }

    // Segunda migração
    const sqlPath2 = path.join(__dirname, "../database/migrations/mysql/002_user_setores.up.sql");
    const sql2 = fs.readFileSync(sqlPath2, "utf-8");

    const statements2 = sql2
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--") && !stmt.startsWith("USE"));

    for (const statement of statements2) {
      try {
        await appConnection.query(statement);
      } catch (err) {
        if (!err.message.includes("already exists")) {
          console.error("Erro:", err.message);
        }
      }
    }

    console.log("   ✅ Tabelas criadas");

    // Criar usuário admin
    console.log("\n3️⃣ Criando usuário admin...");
    try {
      await appConnection.query(
        `INSERT INTO users (email, full_name, cargo, setor, tema, is_active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ["admin@nefadv.com.br", "Administrador", "administrador", "Tecnologia", "claro", 1]
      );
      console.log("   ✅ Usuário admin criado");
    } catch (err) {
      if (err.message.includes("Duplicate")) {
        console.log("   ✅ Usuário admin já existe");
      } else {
        throw err;
      }
    }

    console.log("\n✅ Banco de dados MySQL configurado com sucesso!");
    console.log("   Host: 129.121.55.207:22022 (via SSH tunnel)");
    console.log("   Database: feedback_hub");
    console.log("   Admin: admin@nefadv.com.br");

    await appConnection.end();
    sshProcess.kill();
  } catch (error) {
    console.error("\n❌ Erro:", error.message);
    sshProcess.kill();
    process.exitCode = 1;
  }
}

setupMySQLWithSSHTunnel();
