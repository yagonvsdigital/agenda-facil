#!/bin/bash
# ─── deploy.sh — Executar no servidor após SSH ─────────────────
# Uso: bash deploy.sh

set -e

echo "🚀 Atualizando Agenda Fácil..."

# Puxa últimas mudanças
git pull origin main

# Sobe os containers atualizados
docker compose down
docker compose up -d --build

echo "✅ Deploy concluído!"
echo ""
echo "📡 Verificando saúde da API..."
sleep 10
curl -sf http://localhost:3000/api/v1/health && echo " API OK" || echo " API ainda iniciando..."
