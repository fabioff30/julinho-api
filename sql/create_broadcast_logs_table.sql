-- Tabela para logs de broadcast de mensagens
CREATE TABLE IF NOT EXISTS broadcast_logs (
    id SERIAL PRIMARY KEY,
    message_content TEXT NOT NULL,
    total_contacts INTEGER NOT NULL DEFAULT 0,
    successful_sends INTEGER NOT NULL DEFAULT 0,
    failed_sends INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_broadcast_logs_created_at ON broadcast_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_broadcast_logs_started_at ON broadcast_logs (started_at);

-- Comentários
COMMENT ON TABLE broadcast_logs IS 'Logs de envios de mensagens em massa via WhatsApp';
COMMENT ON COLUMN broadcast_logs.message_content IS 'Conteúdo da mensagem enviada';
COMMENT ON COLUMN broadcast_logs.total_contacts IS 'Número total de contatos elegíveis';
COMMENT ON COLUMN broadcast_logs.successful_sends IS 'Número de envios bem-sucedidos';
COMMENT ON COLUMN broadcast_logs.failed_sends IS 'Número de envios que falharam';
COMMENT ON COLUMN broadcast_logs.started_at IS 'Quando o broadcast foi iniciado';
COMMENT ON COLUMN broadcast_logs.completed_at IS 'Quando o broadcast foi concluído';