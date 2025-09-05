# Guia de Integração Python - WhatsApp Broadcast API

Este guia mostra como integrar o dashboard Python com a API Node.js do WhatsApp Broadcast.

## Configuração Inicial

### 1. Instalar Dependências Python
```bash
pip install requests python-dotenv
```

### 2. Configurar Variáveis de Ambiente
Criar arquivo `.env` no projeto Python:
```env
# API WhatsApp Configuration
WHATSAPP_API_URL=http://localhost:4000
# Para produção: WHATSAPP_API_URL=https://seu-dominio.com
WHATSAPP_API_USERNAME=admin
WHATSAPP_API_PASSWORD=a1b2c3
```

## Classe de Integração Python

### Implementação Completa
```python
import requests
import json
import time
import base64
from typing import Dict, List, Optional
from dataclasses import dataclass
import os
from dotenv import load_dotenv

load_dotenv()

@dataclass
class WhatsAppStatus:
    is_ready: bool
    is_connecting: bool
    status_text: str
    qr_code: Optional[str]

@dataclass
class ContactPreview:
    total_contacts: int
    high_engagement: int
    medium_engagement: int
    low_engagement: int
    estimated_time: str

@dataclass
class BroadcastResult:
    success: bool
    total_contacts: int
    successful_sends: int
    failed_sends: int
    errors: List[Dict]
    started_at: str
    completed_at: str

class WhatsAppAPI:
    def __init__(self):
        self.base_url = os.getenv('WHATSAPP_API_URL', 'http://localhost:4000')
        self.username = os.getenv('WHATSAPP_API_USERNAME', 'admin')
        self.password = os.getenv('WHATSAPP_API_PASSWORD')
        
        if not self.password:
            raise ValueError("WHATSAPP_API_PASSWORD deve estar configurado no .env")
        
        self.session = requests.Session()
        self.session.auth = (self.username, self.password)
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Python-Dashboard/1.0'
        })

    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict:
        """Fazer requisição com tratamento de erro"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(method, url, timeout=30, **kwargs)
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.Timeout:
            return {"success": False, "error": "Timeout", "message": "Requisição expirou"}
        except requests.exceptions.ConnectionError:
            return {"success": False, "error": "Connection Error", "message": "Não foi possível conectar à API"}
        except requests.exceptions.HTTPError as e:
            try:
                error_data = response.json()
                return error_data
            except:
                return {"success": False, "error": f"HTTP {response.status_code}", "message": str(e)}
        except Exception as e:
            return {"success": False, "error": "Unknown Error", "message": str(e)}

    def get_status(self) -> WhatsAppStatus:
        """Verificar status da conexão WhatsApp"""
        result = self._make_request('GET', '/api/messages/status')
        
        if result.get('success'):
            data = result['data']
            return WhatsAppStatus(
                is_ready=data.get('is_ready', False),
                is_connecting=data.get('is_connecting', False),
                status_text=data.get('status_text', 'Unknown'),
                qr_code=data.get('qr_code')
            )
        else:
            return WhatsAppStatus(
                is_ready=False,
                is_connecting=False,
                status_text=f"Erro: {result.get('message', 'Erro desconhecido')}",
                qr_code=None
            )

    def connect(self) -> Dict:
        """Iniciar conexão WhatsApp"""
        return self._make_request('POST', '/api/messages/connect')

    def disconnect(self) -> Dict:
        """Desconectar WhatsApp"""
        return self._make_request('POST', '/api/messages/disconnect')

    def get_preview(self) -> ContactPreview:
        """Obter preview de contatos que receberão mensagem"""
        result = self._make_request('GET', '/api/messages/broadcast/preview')
        
        if result.get('success'):
            data = result['data']
            breakdown = data.get('breakdown', {})
            return ContactPreview(
                total_contacts=data.get('total_eligible_contacts', 0),
                high_engagement=breakdown.get('high_engagement', 0),
                medium_engagement=breakdown.get('medium_engagement', 0),
                low_engagement=breakdown.get('low_engagement', 0),
                estimated_time=data.get('estimated_delivery_time', 'Desconhecido')
            )
        else:
            return ContactPreview(0, 0, 0, 0, f"Erro: {result.get('message', 'Erro desconhecido')}")

    def send_broadcast(self, message: str) -> BroadcastResult:
        """Enviar mensagem em massa"""
        if not message or not message.strip():
            return BroadcastResult(
                success=False, total_contacts=0, successful_sends=0, 
                failed_sends=0, errors=[{"error": "Mensagem não pode estar vazia"}],
                started_at="", completed_at=""
            )

        result = self._make_request('POST', '/api/messages/broadcast', json={'message': message})
        
        if result.get('success'):
            data = result['data']
            return BroadcastResult(
                success=True,
                total_contacts=data.get('total_contacts', 0),
                successful_sends=data.get('successful_sends', 0),
                failed_sends=data.get('failed_sends', 0),
                errors=data.get('errors', []),
                started_at=data.get('started_at', ''),
                completed_at=data.get('completed_at', '')
            )
        else:
            return BroadcastResult(
                success=False, total_contacts=0, successful_sends=0,
                failed_sends=0, errors=[{"error": result.get('message', 'Erro desconhecido')}],
                started_at="", completed_at=""
            )

    def wait_for_connection(self, max_wait_seconds: int = 120) -> bool:
        """Aguardar até WhatsApp estar conectado"""
        start_time = time.time()
        
        while time.time() - start_time < max_wait_seconds:
            status = self.get_status()
            
            if status.is_ready:
                return True
            
            if not status.is_connecting and not status.qr_code:
                # Não está conectando nem tem QR code, algo deu errado
                return False
                
            time.sleep(3)  # Espera 3 segundos antes de verificar novamente
        
        return False

    def get_qr_code_as_image_data(self) -> Optional[bytes]:
        """Obter QR Code como dados de imagem (se disponível)"""
        status = self.get_status()
        
        if status.qr_code:
            try:
                # Assumindo que o QR code vem como base64
                if status.qr_code.startswith('data:image'):
                    # Remove o prefixo data:image/png;base64,
                    base64_data = status.qr_code.split(',')[1]
                    return base64.b64decode(base64_data)
                else:
                    # Se for apenas base64 sem prefixo
                    return base64.b64decode(status.qr_code)
            except Exception:
                return None
        
        return None
```

## Exemplos de Uso

### 1. Verificar Status e Conectar
```python
def verificar_e_conectar():
    api = WhatsAppAPI()
    
    # Verificar status atual
    status = api.get_status()
    print(f"Status: {status.status_text}")
    
    if not status.is_ready:
        print("WhatsApp não está conectado. Iniciando conexão...")
        
        # Conectar
        connect_result = api.connect()
        if connect_result.get('success'):
            print("Conexão iniciada com sucesso!")
            
            # Aguardar conexão ou QR code
            time.sleep(2)
            status = api.get_status()
            
            if status.qr_code:
                print("QR Code disponível! Escaneie com seu WhatsApp:")
                print(f"QR Code: {status.qr_code[:50]}...")  # Primeiros 50 chars
                
                # Aguardar conexão
                if api.wait_for_connection():
                    print("✅ WhatsApp conectado com sucesso!")
                else:
                    print("❌ Timeout na conexão")
            
        else:
            print(f"Erro ao conectar: {connect_result.get('message')}")
    else:
        print("✅ WhatsApp já está conectado!")

# Usar a função
verificar_e_conectar()
```

### 2. Obter Preview de Contatos
```python
def mostrar_preview():
    api = WhatsAppAPI()
    
    preview = api.get_preview()
    print(f"📊 Preview de Broadcast:")
    print(f"   Total de contatos: {preview.total_contacts}")
    print(f"   Alto engajamento: {preview.high_engagement}")
    print(f"   Médio engajamento: {preview.medium_engagement}")
    print(f"   Baixo engajamento: {preview.low_engagement}")
    print(f"   Tempo estimado: {preview.estimated_time}")

# Usar a função
mostrar_preview()
```

### 3. Enviar Broadcast
```python
def enviar_mensagem():
    api = WhatsAppAPI()
    
    # Verificar se está conectado
    status = api.get_status()
    if not status.is_ready:
        print("❌ WhatsApp não está conectado!")
        return
    
    # Obter preview
    preview = api.get_preview()
    print(f"Mensagem será enviada para {preview.total_contacts} contatos")
    
    # Confirmar envio
    mensagem = input("Digite a mensagem para enviar: ")
    confirmar = input(f"Confirma envio para {preview.total_contacts} contatos? (s/N): ")
    
    if confirmar.lower() == 's':
        print("📤 Enviando mensagem...")
        
        result = api.send_broadcast(mensagem)
        
        if result.success:
            print(f"✅ Broadcast concluído!")
            print(f"   Sucessos: {result.successful_sends}")
            print(f"   Falhas: {result.failed_sends}")
            
            if result.errors:
                print("❌ Erros encontrados:")
                for error in result.errors:
                    print(f"   - {error}")
        else:
            print(f"❌ Erro no broadcast: {result.errors}")
    else:
        print("Broadcast cancelado.")

# Usar a função
enviar_mensagem()
```

## Integração com Flask

### Exemplo de Dashboard Web
```python
from flask import Flask, render_template, request, jsonify, redirect, url_for
import os
from whatsapp_api import WhatsAppAPI  # Importar a classe acima

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key')

@app.route('/')
def dashboard():
    api = WhatsAppAPI()
    status = api.get_status()
    preview = api.get_preview()
    
    return render_template('dashboard.html', status=status, preview=preview)

@app.route('/connect', methods=['POST'])
def connect_whatsapp():
    api = WhatsAppAPI()
    result = api.connect()
    
    if result.get('success'):
        return jsonify({"success": True, "message": "Conexão iniciada"})
    else:
        return jsonify({"success": False, "message": result.get('message')}), 500

@app.route('/status')
def get_status():
    api = WhatsAppAPI()
    status = api.get_status()
    
    return jsonify({
        "is_ready": status.is_ready,
        "is_connecting": status.is_connecting,
        "status_text": status.status_text,
        "qr_code": status.qr_code
    })

@app.route('/preview')
def get_preview():
    api = WhatsAppAPI()
    preview = api.get_preview()
    
    return jsonify({
        "total_contacts": preview.total_contacts,
        "breakdown": {
            "high": preview.high_engagement,
            "medium": preview.medium_engagement,
            "low": preview.low_engagement
        },
        "estimated_time": preview.estimated_time
    })

@app.route('/send', methods=['POST'])
def send_broadcast():
    message = request.json.get('message')
    
    if not message:
        return jsonify({"success": False, "message": "Mensagem é obrigatória"}), 400
    
    api = WhatsAppAPI()
    
    # Verificar se está conectado
    status = api.get_status()
    if not status.is_ready:
        return jsonify({"success": False, "message": "WhatsApp não está conectado"}), 503
    
    # Enviar broadcast
    result = api.send_broadcast(message)
    
    if result.success:
        return jsonify({
            "success": True,
            "data": {
                "total_contacts": result.total_contacts,
                "successful_sends": result.successful_sends,
                "failed_sends": result.failed_sends,
                "errors": result.errors
            }
        })
    else:
        return jsonify({"success": False, "message": "Falha no broadcast", "errors": result.errors}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

## Template HTML (dashboard.html)
```html
<!DOCTYPE html>
<html>
<head>
    <title>WhatsApp Broadcast Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .connected { background-color: #d4edda; color: #155724; }
        .disconnected { background-color: #f8d7da; color: #721c24; }
        .form-group { margin: 15px 0; }
        textarea { width: 100%; height: 100px; }
        button { background-color: #25D366; color: white; padding: 10px 20px; border: none; border-radius: 5px; }
        .preview { background-color: #e2e3e5; padding: 15px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>WhatsApp Broadcast Dashboard</h1>
    
    <!-- Status da Conexão -->
    <div class="status {{ 'connected' if status.is_ready else 'disconnected' }}">
        <strong>Status:</strong> {{ status.status_text }}
    </div>
    
    {% if not status.is_ready %}
    <button onclick="connectWhatsApp()">Conectar WhatsApp</button>
    <div id="qr-container" style="display: none;">
        <h3>Escaneie o QR Code:</h3>
        <div id="qr-code"></div>
    </div>
    {% endif %}
    
    <!-- Preview de Contatos -->
    <div class="preview">
        <h3>📊 Preview do Broadcast</h3>
        <p><strong>Total de contatos:</strong> {{ preview.total_contacts }}</p>
        <p><strong>Alto engajamento:</strong> {{ preview.high_engagement }}</p>
        <p><strong>Médio engajamento:</strong> {{ preview.medium_engagement }}</p>
        <p><strong>Baixo engajamento:</strong> {{ preview.low_engagement }}</p>
        <p><strong>Tempo estimado:</strong> {{ preview.estimated_time }}</p>
        <button onclick="updatePreview()">Atualizar Preview</button>
    </div>
    
    <!-- Formulário de Envio -->
    {% if status.is_ready %}
    <form id="broadcast-form">
        <div class="form-group">
            <label for="message">Mensagem:</label>
            <textarea id="message" placeholder="Digite sua mensagem aqui..." required></textarea>
            <small id="char-count">0/4096 caracteres</small>
        </div>
        <button type="submit">Enviar para {{ preview.total_contacts }} contatos</button>
    </form>
    {% endif %}
    
    <div id="result" style="margin-top: 20px;"></div>

    <script>
        // Atualizar contador de caracteres
        document.getElementById('message').addEventListener('input', function() {
            const count = this.value.length;
            document.getElementById('char-count').textContent = count + '/4096 caracteres';
        });
        
        // Conectar WhatsApp
        async function connectWhatsApp() {
            const response = await fetch('/connect', { method: 'POST' });
            const result = await response.json();
            
            if (result.success) {
                checkConnection();
            } else {
                alert('Erro ao conectar: ' + result.message);
            }
        }
        
        // Verificar status da conexão
        async function checkConnection() {
            const response = await fetch('/status');
            const status = await response.json();
            
            if (status.qr_code && !status.is_ready) {
                document.getElementById('qr-container').style.display = 'block';
                document.getElementById('qr-code').innerHTML = 
                    `<img src="data:image/png;base64,${status.qr_code}" alt="QR Code">`;
            }
            
            if (!status.is_ready) {
                setTimeout(checkConnection, 3000); // Verificar novamente em 3s
            } else {
                location.reload(); // Recarregar página quando conectado
            }
        }
        
        // Atualizar preview
        async function updatePreview() {
            const response = await fetch('/preview');
            const preview = await response.json();
            location.reload(); // Recarregar para mostrar novo preview
        }
        
        // Enviar broadcast
        document.getElementById('broadcast-form')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const message = document.getElementById('message').value;
            if (!message.trim()) {
                alert('Por favor, digite uma mensagem.');
                return;
            }
            
            if (!confirm(`Confirma o envio para {{ preview.total_contacts }} contatos?`)) {
                return;
            }
            
            const response = await fetch('/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });
            
            const result = await response.json();
            
            if (result.success) {
                document.getElementById('result').innerHTML = `
                    <div class="status connected">
                        ✅ Broadcast enviado com sucesso!<br>
                        Sucessos: ${result.data.successful_sends}<br>
                        Falhas: ${result.data.failed_sends}
                    </div>
                `;
            } else {
                document.getElementById('result').innerHTML = `
                    <div class="status disconnected">
                        ❌ Erro no broadcast: ${result.message}
                    </div>
                `;
            }
        });
    </script>
</body>
</html>
```

## Tratamento de Erros Comuns

### Códigos de Status HTTP
```python
def handle_api_error(response_data):
    """Tratar diferentes tipos de erro da API"""
    
    if not response_data.get('success'):
        error_message = response_data.get('message', 'Erro desconhecido')
        
        # Mapear erros comuns
        error_mappings = {
            'WhatsApp client is not ready': 'WhatsApp não está conectado. Conecte primeiro.',
            'Message is required': 'Mensagem é obrigatória.',
            'Invalid credentials': 'Credenciais inválidas. Verifique usuário e senha.',
            'Too many requests': 'Muitas requisições. Aguarde um momento.'
        }
        
        return error_mappings.get(error_message, error_message)
    
    return None
```

## Configuração de Produção

### Docker Compose (Opcional)
```yaml
version: '3.8'
services:
  whatsapp-api:
    image: seu-registry/julinho-api:latest
    ports:
      - "4000:4000"
    environment:
      - DB_HOST=postgres
      - DASHBOARD_SECRET=sua-senha-segura
    
  python-dashboard:
    build: .
    ports:
      - "5000:5000"
    environment:
      - WHATSAPP_API_URL=http://whatsapp-api:4000
      - WHATSAPP_API_PASSWORD=sua-senha-segura
    depends_on:
      - whatsapp-api
```

## Monitoramento e Logs

### Sistema de Log
```python
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('whatsapp_dashboard.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Usar nos métodos da classe
class WhatsAppAPI:
    def send_broadcast(self, message: str):
        logger.info(f"Iniciando broadcast para mensagem: {message[:50]}...")
        result = self._make_request('POST', '/api/messages/broadcast', json={'message': message})
        
        if result.get('success'):
            logger.info(f"Broadcast concluído: {result['data']['successful_sends']} sucessos")
        else:
            logger.error(f"Erro no broadcast: {result.get('message')}")
        
        return result
```

Este guia fornece tudo que você precisa para integrar seu dashboard Python com a API WhatsApp! 🚀