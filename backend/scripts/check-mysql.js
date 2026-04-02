import mysql from "mysql2/promise";

async function checkMySQL() {
  try {
    console.log("Conectando ao MySQL remoto em 129.121.55.207:22022...\n");
    
    const connection = await mysql.createConnection({
      host: "129.121.55.207",
      port: 22022,
      user: "root",
      password: "Vps@nef10",
    });

    console.log("✅ Conexão estabelecida com sucesso!\n");

    // Listar bancos de dados
    console.log("📊 Bancos de dados existentes:");
    const [databases] = await connection.query("SHOW DATABASES");
    databases.forEach((db) => {
      console.log(`   - ${db.Database}`);
    });

    // Verificar se feedback_hub existe
    const feedbackHubExists = databases.some((db) => db.Database === "feedback_hub");
    
    if (feedbackHubExists) {
      console.log("\n✅ Banco 'feedback_hub' JÁ EXISTE!");
      
      // Conectar ao banco feedback_hub
      const appConnection = await mysql.createConnection({
        host: "129.121.55.207",
        port: 22022,
        user: "root",
        password: "Vps@nef10",
        database: "feedback_hub",
      });

      // Listar tabelas
      console.log("\n📋 Tabelas no banco 'feedback_hub':");
      const [tables] = await appConnection.query("SHOW TABLES");
      
      if (tables.length === 0) {
        console.log("   ⚠️  Banco vazio - nenhuma tabela encontrada");
      } else {
        tables.forEach((table) => {
          const tableName = Object.values(table)[0];
          console.log(`   - ${tableName}`);
        });
      }

      // Contar usuários
      try {
        const [users] = await appConnection.query("SELECT COUNT(*) as count FROM users");
        console.log(`\n👥 Total de usuários: ${users[0].count}`);
      } catch (err) {
        console.log("\n⚠️  Tabela 'users' não existe ainda");
      }

      await appConnection.end();
    } else {
      console.log("\n❌ Banco 'feedback_hub' NÃO EXISTE - precisa ser criado");
    }

    await connection.end();
  } catch (error) {
    console.error("❌ Erro ao conectar ao MySQL:", error.message);
    process.exitCode = 1;
  }
}

checkMySQL();
