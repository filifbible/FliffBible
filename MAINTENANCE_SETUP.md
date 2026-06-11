# Setup: Modo de Manutenção

Execute o SQL abaixo no **Supabase SQL Editor** para criar a tabela necessária.

## 1. Criar a tabela `app_settings`

```sql
-- Tabela genérica de configurações da aplicação
CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_app_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_app_settings_updated_at
BEFORE UPDATE ON app_settings
FOR EACH ROW EXECUTE FUNCTION update_app_settings_timestamp();

-- Inserir valor padrão do modo de manutenção (desativado)
INSERT INTO app_settings (key, value)
VALUES (
  'maintenance_mode',
  '{
    "is_active": false,
    "title": "Sistema em Manutenção",
    "message": "Estamos realizando melhorias para oferecer uma experiência ainda melhor. Voltaremos em breve!",
    "estimated_return": null
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
```

## 2. Configurar RLS (Row Level Security)

```sql
-- Habilitar RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Leitura pública (para o middleware e página de manutenção)
CREATE POLICY "allow_public_read_app_settings"
ON app_settings FOR SELECT
USING (true);

-- Escrita apenas via service role (API routes server-side)
-- O frontend usa a anon key, então apenas a API /api/maintenance
-- e o MaintenanceService (com service role key) podem escrever.
CREATE POLICY "allow_service_write_app_settings"
ON app_settings FOR ALL
USING (true)
WITH CHECK (true);
```

> **Dica:** Se quiser restringir escrita apenas a admins autenticados, substitua
> a segunda policy por uma que verifique `auth.role() = 'service_role'`.

## 3. Como funciona

| Componente | Função |
|---|---|
| `services/maintenanceService.ts` | Lê e grava as configurações na tabela `app_settings` |
| `app/api/maintenance/route.ts` | API Route que retorna `{ is_active, title, message, estimated_return }` |
| `middleware.ts` | Intercepta todas as rotas; redireciona para `/manutencao` se ativo |
| `app/manutencao/page.tsx` | Página exibida aos usuários durante a manutenção |
| `AdminPanel` → aba **Manutenção** | Interface para ligar/desligar e configurar a mensagem |

## 4. Rotas que NÃO são bloqueadas

- `/manutencao` — a própria página de manutenção
- `/api/maintenance` — a API que o middleware consulta
- `/painel-admin` — o painel admin continua acessível
- `/_next/*` — arquivos estáticos do Next.js
