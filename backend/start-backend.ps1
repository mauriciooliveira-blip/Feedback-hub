# Script para iniciar o backend com variáveis de ambiente configuradas

# Configurar variáveis de ambiente
$env:DB_HOST = "127.0.0.1"
$env:DB_PORT = "3306"
$env:DB_USER = "root"
$env:DB_PASSWORD = "Vps@nef10"
$env:DB_NAME = "feedback_hub"
$env:JWT_SECRET = "feedback-hub-secret-key"
$env:NODE_ENV = "development"
$env:PORT = "3001"
$env:CORS_ORIGIN = "http://localhost:5173"

Write-Host "✅ Variáveis de ambiente configuradas" -ForegroundColor Green
Write-Host "   DB_HOST: $env:DB_HOST" -ForegroundColor Gray
Write-Host "   DB_PORT: $env:DB_PORT" -ForegroundColor Gray
Write-Host "   DB_USER: $env:DB_USER" -ForegroundColor Gray
Write-Host "   DB_NAME: $env:DB_NAME" -ForegroundColor Gray
Write-Host ""

# Executar setup do banco de dados
Write-Host "🔧 Configurando banco de dados..." -ForegroundColor Cyan
node scripts/setup-and-seed.js

Write-Host ""
Write-Host "🚀 Iniciando backend..." -ForegroundColor Green
npm start
