# WhatsApp Broadcast API - Julinho

Este documento descreve os novos endpoints da API para envio de mensagens em massa via WhatsApp.

## Configuração Inicial

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Adicionar no arquivo `.env`:
```env
WHATSAPP_SESSION_PATH=./whatsapp-session
```

### 3. Criar Tabela no Banco de Dados
Execute o script SQL localizado em `sql/create_broadcast_logs_table.sql`:
```sql
psql -h your-host -p port -U user -d database -f sql/create_broadcast_logs_table.sql
```

## Endpoints Disponíveis

### 1. Preview de Broadcast
**GET** `/api/messages/broadcast/preview`

Retorna o número de contatos elegíveis para receber a mensagem.

**Autenticação:** Basic Auth (admin / DASHBOARD_SECRET)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "total_eligible_contacts": 76,
    "criteria": "Contatos que enviaram pelo menos 1 mensagem",
    "breakdown": {
      "high_engagement": 31,
      "medium_engagement": 35,
      "low_engagement": 10
    },
    "estimated_delivery_time": "3 minutos",
    "last_updated": "2025-09-05T13:18:00.270Z"
  },
  "timestamp": "2025-09-05T13:18:00.270Z"
}
```

### 2. Status da Conexão WhatsApp
**GET** `/api/messages/status`

Verifica o status da conexão com o WhatsApp.

**Autenticação:** Basic Auth (admin / DASHBOARD_SECRET)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "is_ready": false,
    "is_connecting": false,
    "has_qr_code": false,
    "client_exists": false,
    "qr_code": null,
    "status_text": "Disconnected"
  },
  "timestamp": "2025-09-05T13:18:02.105Z"
}
```

### 3. Conectar WhatsApp
**POST** `/api/messages/connect`

Inicia a conexão com o WhatsApp. Se for a primeira vez, será necessário escanear o QR Code.

**Autenticação:** Basic Auth (admin / DASHBOARD_SECRET)

**Resposta:**
```json
{
  "success": true,
  "message": "WhatsApp connection initialized. Check status endpoint for QR code if needed.",
  "timestamp": "2025-09-05T13:18:09.389Z"
}
```

### 4. Desconectar WhatsApp
**POST** `/api/messages/disconnect`

Desconecta o cliente WhatsApp.

**Autenticação:** Basic Auth (admin / DASHBOARD_SECRET)

### 5. Enviar Broadcast
**POST** `/api/messages/broadcast`

Envia mensagem para todos os contatos elegíveis.

**Autenticação:** Basic Auth (admin / DASHBOARD_SECRET)

**Body:**
```json
{
  "message": "Sua mensagem aqui"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Broadcast completed",
  "data": {
    "total_contacts": 76,
    "successful_sends": 73,
    "failed_sends": 3,
    "errors": [
      {
        "phone": "5511****1234",
        "error": "Message failed to send"
      }
    ],
    "started_at": "2025-09-05T13:20:00.000Z",
    "completed_at": "2025-09-05T13:23:00.000Z",
    "message_preview": "Sua mensagem aqui"
  },
  "timestamp": "2025-09-05T13:23:00.000Z"
}
```

## Fluxo de Uso

1. **Verificar Status**: `GET /api/messages/status`
2. **Conectar (se necessário)**: `POST /api/messages/connect`
3. **Verificar Preview**: `GET /api/messages/broadcast/preview`
4. **Enviar Broadcast**: `POST /api/messages/broadcast`

## Critérios de Elegibilidade

- Contatos que enviaram **pelo menos 1 mensagem** para o Julinho
- Contatos com telefone válido cadastrado
- Não há filtro por período (todos os contatos históricos)

## Limitações e Segurança

- **Rate Limiting**: 2 segundos entre cada mensagem para evitar bloqueio
- **Validação**: Mensagens não podem estar vazias
- **Limite de Caracteres**: Máximo 4096 caracteres por mensagem
- **Logs**: Todos os broadcasts são registrados na tabela `broadcast_logs`
- **Mascaramento**: Telefones são mascarados nos logs (últimos 4 dígitos)

## Exemplos de Uso com curl

```bash
# Verificar quantos contatos receberão a mensagem
curl "http://localhost:4000/api/messages/broadcast/preview" \
  -u "admin:sua_senha"

# Conectar WhatsApp
curl -X POST "http://localhost:4000/api/messages/connect" \
  -u "admin:sua_senha"

# Verificar status da conexão
curl "http://localhost:4000/api/messages/status" \
  -u "admin:sua_senha"

# Enviar broadcast
curl -X POST "http://localhost:4000/api/messages/broadcast" \
  -H "Content-Type: application/json" \
  -d '{"message":"Olá! Esta é uma mensagem de teste."}' \
  -u "admin:sua_senha"
```

## Possíveis Erros

- **503 Service Unavailable**: WhatsApp não está conectado
- **400 Validation Error**: Mensagem vazia ou inválida
- **401 Unauthorized**: Credenciais inválidas
- **500 Internal Server Error**: Erro interno (ex: falta do Chromium)

## Produção

Para deploy em produção, certifique-se de:

1. Instalar dependências completas: `npm install`
2. Configurar `WHATSAPP_SESSION_PATH` corretamente
3. Ter Chromium disponível no sistema
4. Executar o script SQL de criação da tabela
5. Usar senha forte para `DASHBOARD_SECRET`