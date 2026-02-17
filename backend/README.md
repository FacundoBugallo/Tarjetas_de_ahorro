# Backend Python (FastAPI) para Tarjetas de Ahorro/Deudas + IA GPT

## Ejecutar local
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY="tu_api_key"
export OPENAI_MODEL="gpt-4o-mini"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints listos
- `GET /health`
- `POST /api/debts/plan` calcula el total a pagar (`pago * periodos`).
- `POST /api/ai/chat` consulta GPT vía OpenAI SDK usando `OPENAI_API_KEY`.

## Seguridad importante
- **Nunca** pegues una API key en el código, commits, PRs o chat.
- Si una key fue expuesta, **revócala y genera otra** desde OpenAI.

## Integración GPT (OpenAI)
1. Define `OPENAI_API_KEY` y opcional `OPENAI_MODEL` (por defecto `gpt-4o-mini`).
2. Levanta el backend y usa `POST /api/ai/chat` desde la app.

## ¿Qué hosting elegir para este backend?

### Opción A (recomendada): **Render / Railway / Fly.io**
- Fácil deploy de FastAPI con Docker o comando `uvicorn`.
- SSL y dominio simple.
- Escala sin administrar servidores.

### Opción B: **VPS (Hetzner, DigitalOcean, AWS EC2)**
- Más control y costo ajustable.
- Requiere manejar Nginx, systemd, seguridad y backups.

### Opción C: **Solo MySQL + funciones separadas**
- Útil si ya tienes backend en otro stack.
- MySQL guarda usuarios, tarjetas y movimientos.
- Igual necesitarás una API (FastAPI) para lógica de IA y cálculos.

## Recomendación práctica
- Empieza con **Render + MySQL administrado**.
- Si crece el tráfico, migra a VPS o Kubernetes.
