import { spawn } from "child_process";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startWithSSHTunnel() {
  console.log("🔧 Iniciando SSH tunnel para MySQL...\n");

  // Verificar se SSH está disponível
  try {
    await execAsync("ssh -V");
  } catch (err) {
    console.error("❌ SSH não está instalado ou não está no PATH");
    console.error("   Instale OpenSSH ou adicione ao PATH");
    process.exit(1);
  }

  // Criar SSH tunnel
  const sshProcess = spawn("ssh", [
    "-L",
    "3306:localhost:3306",
    "-N",
    "-v",
    "root@129.121.55.207",
    "-p",
    "22022",
  ]);

  sshProcess.stdout.on("data", (data) => {
    console.log(`[SSH] ${data}`);
  });

  sshProcess.stderr.on("data", (data) => {
    console.log(`[SSH] ${data}`);
  });

  sshProcess.on("error", (err) => {
    console.error("❌ Erro ao iniciar SSH tunnel:", err.message);
    process.exit(1);
  });

  // Aguardar tunnel estar pronto
  console.log("⏳ Aguardando SSH tunnel ficar pronto...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log("✅ SSH tunnel iniciado!\n");
  console.log("🚀 Iniciando backend Node.js...\n");

  // Iniciar backend
  const backendProcess = spawn("node", ["src/server.js"], {
    cwd: __dirname.replace(/scripts$/, ""),
    stdio: "inherit",
    env: {
      ...process.env,
      DB_HOST: "127.0.0.1",
      DB_PORT: "3306",
      DB_USER: "root",
      DB_PASSWORD: "Vps@nef10",
      DB_NAME: "feedback_hub",
      JWT_SECRET: "feedback-hub-secret-key",
      NODE_ENV: "development",
      PORT: "3001",
      CORS_ORIGIN: "http://localhost:5173",
    },
  });

  backendProcess.on("error", (err) => {
    console.error("❌ Erro ao iniciar backend:", err.message);
    sshProcess.kill();
    process.exit(1);
  });

  backendProcess.on("exit", (code) => {
    console.log(`\nBackend encerrado com código ${code}`);
    sshProcess.kill();
    process.exit(code);
  });

  // Encerrar SSH tunnel quando backend encerrar
  process.on("SIGINT", () => {
    console.log("\n🛑 Encerrando...");
    backendProcess.kill();
    sshProcess.kill();
    process.exit(0);
  });
}

startWithSSHTunnel().catch((err) => {
  console.error("❌ Erro:", err.message);
  process.exit(1);
});
