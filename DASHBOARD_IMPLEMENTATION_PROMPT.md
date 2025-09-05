# Prompt para Implementação do Dashboard WhatsApp Broadcast

## Contexto
Implemente uma interface de dashboard para envio de mensagens em massa via WhatsApp. A API backend já está pronta e funcionando.

## API Backend Disponível

**Base URL:** `http://seu-servidor:4000`
**Autenticação:** Basic Auth (username: `admin`, password: `a1b2c3`)

### Endpoints Disponíveis:

1. **Preview de Contatos**
   - `GET /api/messages/broadcast/preview`
   - Retorna quantos contatos receberão a mensagem
   - Resposta: `{ success: true, data: { total_eligible_contacts: 76, breakdown: { high_engagement: 31, medium_engagement: 35, low_engagement: 10 }, estimated_delivery_time: "3 minutos" } }`

2. **Status WhatsApp**
   - `GET /api/messages/status`
   - Verifica se WhatsApp está conectado
   - Resposta: `{ success: true, data: { is_ready: false, is_connecting: false, status_text: "Disconnected", qr_code: null } }`

3. **Conectar WhatsApp**
   - `POST /api/messages/connect`
   - Inicia conexão (pode retornar QR code)

4. **Enviar Broadcast**
   - `POST /api/messages/broadcast`
   - Body: `{ "message": "Sua mensagem aqui" }`
   - Retorna estatísticas de envio

## Requisitos da Interface

### 1. Layout Principal
- **Header**: "WhatsApp Broadcast - Julinho IA"
- **Cards de Status**:
  - Status da Conexão WhatsApp (🔴 Desconectado / 🟢 Conectado)
  - Total de Contatos Elegíveis (ex: "76 contatos")
  - Tempo Estimado de Envio (ex: "3 minutos")

### 2. Seção de Conexão
- **Botão "Conectar WhatsApp"** (quando desconectado)
- **Área para QR Code** (quando aparecer)
- **Botão "Atualizar Status"** para verificar conexão

### 3. Seção de Preview
- **Card com Estatísticas**:
  - Total de contatos elegíveis
  - Breakdown por engagement (Alto: 31, Médio: 35, Baixo: 10)
  - Tempo estimado de entrega
- **Botão "Atualizar Preview"**

### 4. Seção de Envio
- **Textarea** para mensagem (placeholder: "Digite sua mensagem aqui...")
- **Contador de caracteres** (máx: 4096)
- **Botão "Enviar para Todos"** (desabilitado se WhatsApp desconectado)
- **Progress Bar** durante envio
- **Resultados do Envio**:
  - Sucessos vs Falhas
  - Lista de erros (se houver)

### 5. Funcionalidades Extras
- **Auto-refresh** do status a cada 30 segundos
- **Confirmação** antes de enviar ("Enviar para 76 contatos?")
- **Loading states** em todos os botões
- **Toast notifications** para feedback
- **Logs** dos últimos envios

## Especificações Técnicas

### Estados da Aplicação
```javascript
const [whatsappStatus, setWhatsappStatus] = useState({
  isReady: false,
  isConnecting: false,
  statusText: 'Disconnected',
  qrCode: null
});

const [preview, setPreview] = useState({
  totalContacts: 0,
  breakdown: { high: 0, medium: 0, low: 0 },
  estimatedTime: ''
});

const [message, setMessage] = useState('');
const [isSending, setIsSending] = useState(false);
const [sendResult, setSendResult] = useState(null);
```

### Funções Principais
```javascript
// Buscar status do WhatsApp
async function fetchWhatsAppStatus() {
  const response = await fetch('/api/messages/status', {
    headers: { 'Authorization': 'Basic ' + btoa('admin:a1b2c3') }
  });
  return response.json();
}

// Buscar preview de contatos
async function fetchPreview() {
  const response = await fetch('/api/messages/broadcast/preview', {
    headers: { 'Authorization': 'Basic ' + btoa('admin:a1b2c3') }
  });
  return response.json();
}

// Conectar WhatsApp
async function connectWhatsApp() {
  const response = await fetch('/api/messages/connect', {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + btoa('admin:a1b2c3') }
  });
  return response.json();
}

// Enviar broadcast
async function sendBroadcast(message) {
  const response = await fetch('/api/messages/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa('admin:a1b2c3')
    },
    body: JSON.stringify({ message })
  });
  return response.json();
}
```

## Fluxo de UX Desejado

1. **Usuário abre dashboard**
   - Carrega status e preview automaticamente
   - Mostra se WhatsApp está conectado

2. **Se WhatsApp desconectado**:
   - Botão de conectar visível
   - Área de envio desabilitada
   - Usuário clica "Conectar"
   - Mostra QR code se necessário

3. **Quando conectado**:
   - Preview mostra "76 contatos elegíveis"
   - Área de mensagem habilitada
   - Usuário digita mensagem

4. **Ao enviar**:
   - Confirmação: "Enviar para 76 contatos?"
   - Progress bar durante envio
   - Resultado: "73 sucessos, 3 falhas"

## Tecnologias Sugeridas
- **React** com hooks
- **CSS/Tailwind** para styling
- **Axios** para requests
- **React Query** para cache (opcional)

## Tratamento de Erros
- **401**: "Credenciais inválidas"
- **503**: "WhatsApp não conectado"
- **400**: "Mensagem inválida"
- **500**: "Erro interno do servidor"

## Design Visual
- **Cores**: Verde WhatsApp (#25D366) para sucessos
- **Ícones**: WhatsApp, usuários, relógio, check/erro
- **Layout responsivo**: Desktop-first
- **Cards**: Sombras suaves, bordas arredondadas

Implemente uma interface limpa, intuitiva e profissional que permita gerenciar facilmente o envio de mensagens em massa via WhatsApp.