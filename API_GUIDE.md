# 📊 Julinho WhatsApp IA - Guia Completo da API

**URL Base:** `https://julinho-ia-julinho-api.3j5ljv.easypanel.host`

---

## 🔐 Autenticação

A API utiliza **Basic Authentication** para endpoints protegidos:

- **Username:** `admin`
- **Password:** `a1b2c3` (valor de `DASHBOARD_SECRET`)

```bash
# Exemplo de uso
curl -u admin:a1b2c3 https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/geographic/overview
```

---

## 🏥 Endpoints de Saúde (Sem Autenticação)

### 1. Health Check Básico
**GET** `/api/health`

Verifica status básico da API.

```bash
curl https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/health
```

**Resposta:**
```json
{
  "status": "ok",
  "service": "Julinho WhatsApp IA",
  "version": "1.0.0",
  "timestamp": "2025-09-04T15:30:00.000Z"
}
```

### 2. Health Check Detalhado
**GET** `/api/health/detailed`

Status completo de todos os serviços (Redis, Database, WhatsApp, AI, Brevo).

```bash
curl https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/health/detailed
```

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2025-09-04T15:30:00.000Z",
  "environment": "production",
  "uptime": 3600,
  "memory": {
    "used": 45,
    "total": 512,
    "heap_used": 30,
    "external": 5
  },
  "services": {
    "redis": {
      "status": "connected",
      "response_time_ms": 2,
      "connection_state": "connected"
    },
    "database": {
      "status": "connected",
      "response_time_ms": null,
      "version": "PostgreSQL"
    },
    "whatsapp": {
      "status": "ready",
      "number": "558499401840",
      "session_active": true
    },
    "ai": {
      "status": "operational",
      "model": "gemini-2.0-flash-exp",
      "last_request": "2025-09-04T15:30:00.000Z"
    },
    "brevo": {
      "status": "active",
      "api_key_valid": true
    }
  }
}
```

---

## 🗺️ APIs Geográficas (Com Autenticação)

### 1. Visão Geral Geográfica
**GET** `/api/reports/geographic/overview`

Estatísticas gerais sobre distribuição geográfica dos contatos.

```bash
curl -u admin:a1b2c3 https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/geographic/overview
```

**Resposta:**
```json
{
  "total_contacts": 55,
  "contacts_with_geo_data": 24,
  "contacts_without_geo_data": 31,
  "enrichment_percentage": 43.64,
  "unique_states": 4,
  "unique_ddds": 10,
  "unique_regions": 3,
  "generated_at": "2025-09-04T15:30:00.000Z"
}
```

### 2. Ranking de Estados
**GET** `/api/reports/geographic/states`

Lista estados brasileiros ordenados por número de contatos.

```bash
curl -u admin:a1b2c3 https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/geographic/states
```

**Resposta:**
```json
{
  "states": [
    {
      "state": "SP",
      "state_name": "São Paulo",
      "region": "Sudeste",
      "total_contacts": 15,
      "heavy_users": 8,
      "total_messages": 245,
      "avg_messages_per_user": 16.33,
      "avg_daily_messages": 12.25,
      "percentage_of_total": 62.5
    },
    {
      "state": "RJ",
      "state_name": "Rio de Janeiro", 
      "region": "Sudeste",
      "total_contacts": 6,
      "heavy_users": 2,
      "total_messages": 89,
      "avg_messages_per_user": 14.83,
      "avg_daily_messages": 11.12,
      "percentage_of_total": 25.0
    }
  ],
  "generated_at": "2025-09-04T15:30:00.000Z"
}
```

### 3. Ranking de Cidades/DDDs
**GET** `/api/reports/geographic/cities`

Top cidades/DDDs por número de contatos.

```bash
curl -u admin:a1b2c3 https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/geographic/cities
```

**Resposta:**
```json
{
  "cities": [
    {
      "ddd": "11",
      "city": "São Paulo",
      "state": "SP",
      "state_name": "São Paulo",
      "region": "Sudeste",
      "total_contacts": 8,
      "heavy_users": 5,
      "total_messages": 156,
      "avg_messages_per_user": 19.5,
      "avg_daily_messages": 15.6
    }
  ],
  "generated_at": "2025-09-04T15:30:00.000Z"
}
```

### 4. Estatísticas por Região
**GET** `/api/reports/geographic/regions`

Dados agrupados por regiões do Brasil.

```bash
curl -u admin:a1b2c3 https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/geographic/regions
```

**Resposta:**
```json
{
  "regions": [
    {
      "region": "Sudeste",
      "states_in_region": 2,
      "total_contacts": 21,
      "heavy_users": 10,
      "total_messages": 334,
      "avg_messages_per_user": 15.9,
      "percentage_of_total": 87.5
    },
    {
      "region": "Nordeste", 
      "states_in_region": 1,
      "total_contacts": 3,
      "heavy_users": 0,
      "total_messages": 18,
      "avg_messages_per_user": 6.0,
      "percentage_of_total": 12.5
    }
  ],
  "generated_at": "2025-09-04T15:30:00.000Z"
}
```

### 5. Heavy Users por Localização
**GET** `/api/reports/geographic/heavy-users-by-location`

Heavy users organizados por localização geográfica.

```bash
curl -u admin:a1b2c3 https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/geographic/heavy-users-by-location
```

**Resposta:**
```json
{
  "heavy_users": [
    {
      "phone": "5511948****",
      "last_message_preview": "Oi Julinho",
      "total_messages": 78,
      "avg_messages_per_day": 39.0,
      "engagement_level": "high",
      "location": {
        "ddd": "11",
        "city": "São Paulo", 
        "state": "SP",
        "state_name": "São Paulo",
        "region": "Sudeste"
      },
      "last_interaction": "2025-09-04T12:30:00.000Z"
    }
  ],
  "generated_at": "2025-09-04T15:30:00.000Z"
}
```

### 6. Dados para Heatmap
**GET** `/api/reports/geographic/heatmap`

Dados otimizados para visualização em mapas de calor.

```bash
curl -u admin:a1b2c3 https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/geographic/heatmap
```

**Resposta:**
```json
{
  "heatmap_data": [
    {
      "state": "SP",
      "state_name": "São Paulo",
      "region": "Sudeste", 
      "contact_count": 15,
      "message_count": 245,
      "heavy_user_count": 8,
      "avg_messages": 16.33
    }
  ],
  "generated_at": "2025-09-04T15:30:00.000Z"
}
```

---

## 👥 APIs de Usuários (Com Autenticação)

### 1. Heavy Users
**GET** `/api/reports/users/heavy`

Lista de usuários com alto engajamento (50+ mensagens ou 10+ msgs/dia).

**Parâmetros de Query:**
- `days` (opcional): Período em dias (default: 30)
- `limit` (opcional): Número máximo de resultados (default: 50)

```bash
curl -u admin:a1b2c3 "https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/users/heavy?days=7&limit=10"
```

**Resposta:**
```json
{
  "users": [
    {
      "phone": "5511948****",
      "last_message_preview": "Oi Julinho",
      "email": "user@example.com",
      "total_messages": 78,
      "messages_sent_by_user": 41,
      "messages_sent_by_bot": 37,
      "first_interaction": "2025-09-03T05:03:54.609Z",
      "last_interaction": "2025-09-04T17:30:36.161Z",
      "days_active": 2,
      "avg_messages_per_day": "39.00",
      "engagement_level": "high",
      "is_lead": true,
      "user_category": "heavy",
      "recommended_for": "vip_campaign"
    }
  ],
  "statistics": {
    "total_users": 10,
    "super_heavy_users": 1,
    "heavy_users": 4,
    "high_frequency_users": 5,
    "avg_messages": 32,
    "total_messages": 320
  },
  "criteria": "Last 7 days, top 10 users",
  "generated_at": "2025-09-04T15:30:00.000Z"
}
```

### 2. Distribuição de Uso
**GET** `/api/reports/usage/distribution`

Estatísticas sobre distribuição dos níveis de engajamento.

```bash
curl -u admin:a1b2c3 https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/usage/distribution
```

**Resposta:**
```json
{
  "distribution": [
    {
      "engagement_level": "high",
      "user_count": 24,
      "percentage": 43.64,
      "avg_messages": 21.13,
      "avg_daily_messages": 18.38
    },
    {
      "engagement_level": "medium", 
      "user_count": 25,
      "percentage": 45.45,
      "avg_messages": 5.36,
      "avg_daily_messages": 5.2
    },
    {
      "engagement_level": "low",
      "user_count": 6,
      "percentage": 10.91,
      "avg_messages": 2.0,
      "avg_daily_messages": 2.0
    }
  ],
  "totals": {
    "total_users": 55,
    "total_messages": 653
  },
  "generated_at": "2025-09-04T15:30:00.000Z"
}
```

---

## 📋 APIs de Contatos (Com Autenticação)

### 1. Lista de Contatos
**GET** `/api/reports/contacts`

Lista paginada de contatos com suas métricas.

**Parâmetros de Query:**
- `limit` (opcional): Número de resultados por página (default: 100)
- `offset` (opcional): Ponto de início para paginação (default: 0)
- `engagement` (opcional): Filtro por nível (high/medium/low)
- `days` (opcional): Período em dias (default: 30)

```bash
curl -u admin:a1b2c3 "https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/contacts?limit=5&engagement=high"
```

**Resposta:**
```json
{
  "contacts": [
    {
      "phone": "5511948****",
      "last_message_preview": "Oi Julinho",
      "email": "user@example.com",
      "first_interaction": "2025-09-03T05:03:54.609Z",
      "last_interaction": "2025-09-04T17:30:36.161Z", 
      "total_messages": 78,
      "messages_sent_by_user": 41,
      "messages_sent_by_bot": 37,
      "days_active": 2,
      "avg_messages_per_day": "39.00",
      "engagement_level": "high",
      "is_lead": true
    }
  ],
  "total_contacts": 24,
  "pagination": {
    "limit": 5,
    "offset": 0,
    "has_more": true
  },
  "filters_applied": {
    "engagement_level": "high",
    "days_lookback": 30
  }
}
```

### 2. Exportar Contatos
**GET** `/api/reports/contacts/export`

Exporta contatos em formato JSON ou CSV.

**Parâmetros de Query:**
- `min_messages` (opcional): Mínimo de mensagens (default: 1)
- `days` (opcional): Período em dias (default: 30)
- `format` (opcional): json ou csv (default: json)

```bash
# Exportar como JSON
curl -u admin:a1b2c3 "https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/contacts/export?min_messages=10&format=json"

# Exportar como CSV
curl -u admin:a1b2c3 "https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/contacts/export?min_messages=10&format=csv" > contacts.csv
```

**Resposta JSON:**
```json
{
  "exported_at": "2025-09-04T15:30:00.000Z",
  "total_contacts": 15,
  "criteria": "minimum 10 messages in 30 days",
  "contacts": [
    {
      "phone": "5511948****",
      "last_message_preview": "Oi Julinho",
      "email": "user@example.com",
      "total_messages": 78,
      "engagement_level": "high",
      "last_interaction": "2025-09-04T17:30:36.161Z",
      "is_lead": true,
      "recommended_for": "vip_campaign"
    }
  ]
}
```

**Resposta CSV:**
```csv
phone,last_message_preview,email,total_messages,engagement_level,last_interaction,is_lead,recommended_for
5511948****,"Oi Julinho","user@example.com",78,high,Thu Sep 04 2025 14:30:36 GMT-0300,true,vip_campaign
```

---

## 🛠️ APIs Administrativas (Com Autenticação)

### 1. Enriquecer Dados Geográficos
**POST** `/api/reports/geographic/enrich`

Processa contatos para extrair dados geográficos dos telefones.

```bash
curl -X POST -u admin:a1b2c3 https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/geographic/enrich
```

**Resposta:**
```json
{
  "total_processed": 100,
  "successfully_enriched": 85,
  "errors": 15,
  "remaining_without_data": 15,
  "processed_at": "2025-09-04T15:30:00.000Z"
}
```

### 2. Limpar Dados Inconsistentes
**POST** `/api/reports/geographic/cleanup`

Identifica e corrige dados geográficos inconsistentes.

```bash
curl -X POST -u admin:a1b2c3 https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/geographic/cleanup
```

**Resposta:**
```json
{
  "inconsistent_records_found": 10,
  "successfully_cleaned": 8,
  "remaining_issues": 2,
  "cleaned_at": "2025-09-04T15:30:00.000Z"
}
```

---

## 📝 Endpoints Informativos (Sem Autenticação)

### 1. Raiz da API
**GET** `/`

Documentação básica da API com lista de endpoints.

```bash
curl https://julinho-ia-julinho-api.3j5ljv.easypanel.host/
```

### 2. Visão Geral dos Reports
**GET** `/api/reports`

Lista todos os endpoints disponíveis nos reports.

```bash
curl https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports
```

---

## 🔄 Níveis de Engajamento

- **High:** 50+ mensagens totais OU 10+ mensagens por dia
- **Medium:** 10-49 mensagens OU 3-9 mensagens por dia
- **Low:** Menos de 10 mensagens e menos de 3 por dia

## 🗺️ Regiões e DDDs Suportados

- **67+ DDDs brasileiros** mapeados
- **26 estados + DF** cobertos
- **5 regiões:** Norte, Nordeste, Centro-Oeste, Sudeste, Sul

---

## 🚨 Códigos de Resposta HTTP

- **200:** Sucesso
- **401:** Não autorizado (Basic Auth requerida)
- **404:** Endpoint não encontrado
- **429:** Rate limit excedido (100 requests/minuto)
- **500:** Erro interno do servidor

---

## 📊 Exemplos de Integração

### JavaScript/Fetch
```javascript
const auth = btoa('admin:a1b2c3');

async function getGeographicOverview() {
  const response = await fetch('https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/geographic/overview', {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
}
```

### Python/Requests
```python
import requests

def get_heavy_users():
    url = 'https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/users/heavy'
    response = requests.get(url, auth=('admin', 'a1b2c3'))
    return response.json()
```

### PHP/cURL
```php
function getContacts() {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://julinho-ia-julinho-api.3j5ljv.easypanel.host/api/reports/contacts');
    curl_setopt($ch, CURLOPT_USERPWD, 'admin:a1b2c3');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}
```

---

## 📞 Suporte e Monitoramento

- **Health Check:** Use `/api/health/detailed` para monitoramento
- **Logs:** Disponíveis no EasyPanel
- **Performance:** Rate limit de 100 requests/minuto
- **Uptime:** Monitoramento automático via health checks

---

**🚀 API Pronta para Uso!**

Todos os endpoints estão funcionais e prontos para integração com dashboards, relatórios e sistemas de analytics.