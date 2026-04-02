import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "../src/config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setupMySQL() {
  // Conectar sem especificar banco de dados para criar o banco
  const adminConnection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
  });

  try {
    console.log("Conectando ao MySQL...");
    
    // Criar banco de dados
    console.log("\n1️⃣ Criando banco de dados feedback_hub...");
    try {
      await adminConnection.query(`
        CREATE DATABASE IF NOT EXISTS feedback_hub
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci;
      `);
      console.log("✓ Banco de dados criado/verificado");
    } catch (err) {
      console.error("Erro ao criar banco de dados:", err.message);
      throw err;
    }

    // Conectar ao banco de dados feedback_hub
    const appConnection = await mysql.createConnection({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.name,
    });

    // Ler e executar script de criação de tabelas
    console.log("\n2️⃣ Criando tabelas...");
    const sqlPath = path.join(__dirname, "../database/migrations/mysql/001_create_schema.up.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    // Dividir em statements individuais
    const statements = sql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    for (const statement of statements) {
      try {
        await appConnection.query(statement);
      } catch (err) {
        if (!err.message.includes("already exists") && !err.message.includes("Duplicate")) {
          console.error("Erro ao executar:", statement.substring(0, 50));
          throw err;
        }
      }
    }

    // Executar segunda migração
    const sqlPath2 = path.join(__dirname, "../database/migrations/mysql/002_user_setores.up.sql");
    const sql2 = fs.readFileSync(sqlPath2, "utf-8");

    const statements2 = sql2
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    for (const statement of statements2) {
      try {
        await appConnection.query(statement);
      } catch (err) {
        if (!err.message.includes("already exists") && !err.message.includes("Duplicate")) {
          console.error("Erro ao executar:", statement.substring(0, 50));
          throw err;
        }
      }
    }

    console.log("✓ Tabelas criadas/verificadas");

    console.log("\n✅ Banco de dados MySQL configurado com sucesso!");
    console.log(`   Host: ${env.db.host}:${env.db.port}`);
    console.log(`   Database: ${env.db.name}`);
    console.log(`   User: ${env.db.user}`);

    await appConnection.end();
  } catch (error) {
    console.error("\n❌ Erro ao configurar banco de dados:", error.message);
    process.exitCode = 1;
  } finally {
    await adminConnection.end();
  }
}

setupMySQL();
