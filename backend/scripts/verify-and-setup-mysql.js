import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function verifyAndSetupMySQL() {
  const config = {
    host: "129.121.55.207",
    port: 22022,
    user: "root",
    password: "Vps@nef10",
  };

  let adminConnection;
  try {
    console.log("Conectando ao MySQL remoto...\n");
    adminConnection = await mysql.createConnection(config);

    // Verificar se banco existe
    console.log("1️⃣ Verificando banco de dados feedback_hub...");
    const [databases] = await adminConnection.query("SHOW DATABASES");
    const feedbackHubExists = databases.some((db) => db.Database === "feedback_hub");

    if (!feedbackHubExists) {
      console.log("   ❌ Banco não existe - criando...");
      await adminConnection.query(`
        CREATE DATABASE feedback_hub
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci;
      `);
      console.log("   ✅ Banco criado");
    } else {
      console.log("   ✅ Banco já existe");
    }

    // Conectar ao banco feedback_hub
    const appConnection = await mysql.createConnection({
      ...config,
      database: "feedback_hub",
    });

    // Verificar tabelas
    console.log("\n2️⃣ Verificando tabelas...");
    const [tables] = await appConnection.query("SHOW TABLES");
    const tableNames = tables.map((t) => Object.values(t)[0]);

    if (tableNames.length === 0) {
      console.log("   ❌ Nenhuma tabela encontrada - criando schema...");

      // Ler e executar migrations
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
    } else {
      console.log(`   ✅ ${tableNames.length} tabelas encontradas:`);
      tableNames.forEach((t) => console.log(`      - ${t}`));
    }

    // Verificar usuários
    console.log("\n3️⃣ Verificando usuários...");
    const [users] = await appConnection.query("SELECT COUNT(*) as count FROM users");
    const userCount = users[0].count;

    if (userCount === 0) {
      console.log("   ❌ Nenhum usuário encontrado - criando admin...");
      await appConnection.query(
        `INSERT INTO users (email, full_name, cargo, setor, tema, is_active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ["admin@nefadv.com.br", "Administrador", "administrador", "Tecnologia", "claro", 1]
      );
      console.log("   ✅ Usuário admin criado");
      console.log(`      Email: admin@nefadv.com.br`);
    } else {
      console.log(`   ✅ ${userCount} usuário(s) encontrado(s)`);
    }

    console.log("\n✅ Banco de dados MySQL configurado com sucesso!");
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Database: feedback_hub`);

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

verifyAndSetupMySQL();
