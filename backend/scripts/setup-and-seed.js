import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setupAndSeed() {
  const config = {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "Vps@nef10",
  };

  let adminConnection;
  try {
    console.log("Conectando ao MySQL via localhost (SSH tunnel)...\n");
    adminConnection = await mysql.createConnection(config);

    // Criar banco de dados
    console.log("1️⃣ Verificando banco de dados feedback_hub...");
    try {
      await adminConnection.query(`
        CREATE DATABASE IF NOT EXISTS feedback_hub
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci;
      `);
      console.log("   ✅ Banco criado/verificado");
    } catch (err) {
      console.log("   ✅ Banco já existe");
    }

    // Conectar ao banco feedback_hub
    const appConnection = await mysql.createConnection({
      ...config,
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
          console.error("   Erro:", err.message.substring(0, 80));
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
          console.error("   Erro:", err.message.substring(0, 80));
        }
      }
    }

    console.log("   ✅ Tabelas criadas/verificadas");

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

    // Verificar dados
    console.log("\n4️⃣ Verificando dados...");
    const [users] = await appConnection.query("SELECT COUNT(*) as count FROM users");
    const [tables] = await appConnection.query("SHOW TABLES");
    
    console.log(`   ✅ ${tables.length} tabelas criadas`);
    console.log(`   ✅ ${users[0].count} usuário(s) no banco`);

    console.log("\n✅ Banco de dados MySQL configurado com sucesso!");
    console.log("   Host: 127.0.0.1:3306 (via SSH tunnel)");
    console.log("   Database: feedback_hub");
    console.log("   Admin: admin@nefadv.com.br");

    await appConnection.end();
  } catch (error) {
    console.error("\n❌ Erro:", error.message);
    process.exitCode = 1;
  } finally {
    if (adminConnection) {
      await adminConnection.end();
    }
  }
}

setupAndSeed();
