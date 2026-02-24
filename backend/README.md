# Backend Python (FastAPI) para Tarjetas de Ahorro/Deudas + IA GPT

Backend componentizado por capas:
- `app/routers`: endpoints HTTP.
- `app/services`: lógica de negocio y OpenAI.
- `app/schemas.py`: contratos de entrada/salida.
- `app/config.py`: configuración por variables de entorno.

## Ejecutar local
```bash
cd backend
py -3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY="pega_aqui_tu_api_key"
export OPENAI_MODEL="gpt-4o-mini"
export SUPABASE_URL="https://TU-PROYECTO.supabase.co"
export SUPABASE_ANON_KEY="tu_anon_key"
export SUPABASE_SERVICE_ROLE_KEY="tu_service_role_key"
# opcional:
# export SUPABASE_ONBOARDING_TABLE="onboarding_answers"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Conectar la app móvil al backend local
- Web usa `http://localhost:8000` automáticamente.
- Android Emulator usa `http://10.0.2.2:8000` automáticamente.
- Dispositivo físico (iOS/Android): define la URL de tu máquina en Expo antes de iniciar:

```bash
export EXPO_PUBLIC_BACKEND_URL="http://TU_IP_LOCAL:8000"
npm run start
```

> Ejemplo: `http://192.168.1.25:8000` (tu celular y tu computadora deben estar en la misma red Wi-Fi).

## Endpoints listos
- `GET /health`
- `POST /api/debts/plan` calcula el total a pagar (`pago * periodos`).
- `POST /api/ai/chat` consulta GPT vía OpenAI SDK usando `OPENAI_API_KEY`.
- `POST /api/ai/daily-recommendation` genera recomendación diaria personalizada con GPT.
- `POST /api/auth/register` crea un usuario en Supabase Auth.
- `POST /api/auth/login` valida credenciales en Supabase Auth.
- `POST /api/auth/onboarding` guarda respuestas del onboarding en Supabase (`onboarding_answers` por defecto).

## Tabla recomendada para onboarding en Supabase
Ejecutá este SQL en Supabase (SQL Editor):

```sql
create table if not exists public.onboarding_answers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  meta text not null,
  ritmo text not null,
  prioridad text not null,
  acompanamiento text not null,
  moneda_base text not null,
  updated_at timestamptz not null default now()
);

create or replace function public.set_onboarding_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_onboarding_updated_at on public.onboarding_answers;
create trigger trg_onboarding_updated_at
before update on public.onboarding_answers
for each row execute procedure public.set_onboarding_updated_at();
```

## Seguridad importante
- **Nunca** pegues una API key en el código, commits, PRs o chat.
- Si una key fue expuesta, **revócala y genera otra** desde OpenAI/Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` solo debe vivir en el backend (nunca en frontend).

## Ejemplos rápidos de uso
### Chat
```bash
curl -X POST http://localhost:8000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"¿Cómo puedo organizar mejor mis gastos semanales?"}'
```

### Recomendación diaria
```bash
curl -X POST http://localhost:8000/api/ai/daily-recommendation \
  -H "Content-Type: application/json" \
  -d '{
    "spending_control": "evité domicilios",
    "savings_action": "guardé 15000",
    "debt_action": "pagué cuota mínima",
    "user_name": "Ana",
    "planned_investment": 200000,
    "saved_this_month": 90000,
    "pending_debt_total": 650000,
    "currency": "COP"
  }'
```
