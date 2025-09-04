# Julinho Analytics API

API separada para expor dados de analytics do Julinho em formato JSON. Esta API lê dados do banco de dados do agente e os disponibiliza através de endpoints REST para consumption por dashboards e outras aplicações.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Executar em modo desenvolvimento
npm run dev

# Executar em produção
npm start
```

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL (banco do agente Julinho)
- Acesso aos dados do banco `julinho-ia`

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```bash
# Configurações da API
NODE_ENV=production
PORT=4000

# Banco de dados PostgreSQL (mesmo do agente)
DB_HOST=julinho-ia_julinho
DB_PORT=5432
DB_NAME=julinho-ia
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## 📡 Endpoints Disponíveis

### Health Check
- **GET /health** - Status da API e conexão com banco

### Dashboard Metrics
- **GET /api/dashboard?days=30** - Métricas gerais do dashboard

### Heavy Users
- **GET /api/heavy-users?days=30&limit=20** - Usuários com alta atividade

### Contacts
- **GET /api/contacts?limit=100&days=30&engagement_level=high** - Lista de contatos

### Export
- **GET /api/export/contacts?format=json&min_messages=1&days=30** - Export de contatos
- **GET /api/export/contacts?format=csv&min_messages=1&days=30** - Export CSV

### Top Users  
- **GET /api/top-users?days=30&limit=10** - Usuários mais ativos

## 📊 Exemplo de Resposta

### Heavy Users Response
```json
{
  "users": [
    {
      "phone": "11987****",
      "name": "João Silva",
      "whatsapp_name": "João Silva", 
      "lead_name": "João",
      "email": "joao@email.com",
      "total_messages": 145,
      "messages_sent_by_user": 89,
      "messages_sent_by_bot": 56,
      "first_interaction": "2024-01-15T10:30:00.000Z",
      "last_interaction": "2024-02-28T16:45:00.000Z",
      "days_active": 44,
      "avg_messages_per_day": 3.3,
      "engagement_level": "high",
      "is_lead": true,
      "user_category": "super_heavy",
      "recommended_for": "vip_campaign"
    }
  ],
  "statistics": {
    "total_users": 15,
    "super_heavy_users": 3,
    "heavy_users": 8,
    "high_frequency_users": 4,
    "avg_messages": 67,
    "total_messages": 1005
  },
  "criteria": "Last 30 days, top 20 users",
  "generated_at": "2024-02-28T20:15:30.123Z"
}
```

## 🔐 Segurança

- Rate limiting configurável (padrão: 100 req/min)
- CORS habilitado para cross-origin requests
- Helmet.js para headers de segurança
- Mascaramento de telefones nas respostas
- Logs estruturados de todas as requisições

## 🏗️ Arquitetura

```
src/
├── app.js              # Aplicação Express principal
├── config/
│   └── database.js     # Configuração e pool do PostgreSQL
├── services/
│   └── analytics.service.js  # Lógica de negócio e queries
└── routes/
    └── analytics.js    # Definição das rotas HTTP
```

## 🔄 Diferenças do Agente Principal

Esta API é **somente leitura** e focada em:

- ✅ Expor dados existentes via REST JSON
- ✅ Performance otimizada para dashboards  
- ✅ Rate limiting generoso (100 req/min vs 10 req/min do agente)
- ✅ CORS liberado para frontends
- ❌ Não processa mensagens WhatsApp
- ❌ Não conecta com WhatsApp Web
- ❌ Não faz inferências de IA
- ❌ Não modifica dados (somente leitura)

## 🚀 Deploy

### Docker (Recomendado)
```bash
# Build
docker build -t julinho-api .

# Run
docker run -d \
  -p 4000:4000 \
  --env-file .env \
  --name julinho-api \
  julinho-api
```

### PM2
```bash
npm install -g pm2
pm2 start src/app.js --name "julinho-api"
pm2 startup
pm2 save
```

## 📈 Monitoramento

- Logs estruturados em `logs/api.log`
- Health check endpoint para load balancers
- Métricas de performance nas queries
- Error tracking integrado

## 🤝 Integração com Dashboard

Para integrar com seu frontend:

```javascript
// Exemplo de integração
const API_BASE = 'http://localhost:4000/api';

// Buscar heavy users
const heavyUsers = await fetch(`${API_BASE}/heavy-users?days=30&limit=20`)
  .then(res => res.json());

// Buscar métricas do dashboard  
const metrics = await fetch(`${API_BASE}/dashboard?days=7`)
  .then(res => res.json());
```

## 🐛 Troubleshooting

### Erro 429 (Rate Limit)
- Aumente `RATE_LIMIT_MAX_REQUESTS` no .env
- Implemente retry logic no frontend

### Conexão com banco falha
- Verifique credenciais no .env
- Confirme que o banco está acessível
- Check logs em `logs/api.log`

### Performance lenta
- Verifique índices nas tabelas contacts/messages
- Monitore logs de query duration
- Considere cache Redis para queries frequentes

## 📝 Changelog

### v1.0.0
- ✅ API inicial com todos endpoints essenciais
- ✅ Separação completa do agente principal
- ✅ Sistema de nomes WhatsApp vs Lead names
- ✅ Rate limiting e segurança configurados