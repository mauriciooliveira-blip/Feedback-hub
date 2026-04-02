import mysql from "mysql2/promise";

async function testConnections() {
  const configs = [
    { port: 3306, name: "Porta padrão MySQL (3306)" },
    { port: 22022, name: "Porta SSH (22022)" },
    { port: 3307, name: "Porta alternativa (3307)" },
    { port: 33060, name: "Porta X Protocol (33060)" },
  ];

  for (const config of configs) {
    try {
      console.log(`\nTestando ${config.name}...`);
      const connection = await mysql.createConnection({
        host: "129.121.55.207",
        port: config.port,
        user: "root",
        password: "Vps@nef10",
        connectTimeout: 5000,
      });

      console.log(`✅ SUCESSO na porta ${config.port}!`);
      const [databases] = await connection.query("SHOW DATABASES");
      console.log(`   Bancos encontrados: ${databases.length}`);
      const feedbackHub = databases.find((db) => db.Database === "feedback_hub");
      if (feedbackHub) {
        console.log("   ✅ Banco 'feedback_hub' existe!");
      } else {
        console.log("   ❌ Banco 'feedback_hub' NÃO existe");
      }
      await connection.end();
      break;
    } catch (err) {
      console.log(`❌ Falha: ${err.message.substring(0, 50)}`);
    }
  }
}

testConnections();
