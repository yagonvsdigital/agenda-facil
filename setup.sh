#!/usr/bin/env bash
# setup.sh — Configuração inicial do projeto CorteJá
# Execute uma vez após clonar o repositório

set -e

echo "=== CorteJá — Setup ==="

# 1. Copia variáveis de ambiente
if [ ! -f corteja-api/.env ]; then
  cp corteja-api/env.example corteja-api/.env
  echo "[OK] corteja-api/.env criado — edite com suas credenciais"
fi

if [ ! -f corteja/.env ]; then
  cp corteja/env.example corteja/.env
  echo "[OK] corteja/.env criado"
fi

# 2. Instala dependências
echo "[...] Instalando dependências do backend..."
cd corteja-api && npm install && cd ..

echo "[...] Instalando dependências do frontend..."
cd corteja && npm install && cd ..

echo ""
echo "=== Setup concluído ==="
echo ""
echo "Para rodar em desenvolvimento:"
echo "  Terminal 1 → cd corteja-api && npm run start:dev"
echo "  Terminal 2 → cd corteja    && npm run dev"
echo ""
echo "Para rodar com Docker (produção):"
echo "  docker compose up --build"
echo ""
echo "Acesse: http://localhost:5173 (dev) | http://localhost (docker)"
