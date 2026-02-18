from fastapi import HTTPException
from openai import OpenAI

from app.config import OPENAI_API_KEY, OPENAI_MODEL, SYSTEM_PROMPT
from app.schemas import DailyRecommendationRequest


def _build_client() -> OpenAI:
    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail='Falta OPENAI_API_KEY en variables de entorno del backend.',
        )
    return OpenAI(api_key=OPENAI_API_KEY)


def _chat_completion(user_message: str) -> str:
    client = _build_client()
    try:
        completion = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': user_message},
            ],
            temperature=0.5,
        )
        return completion.choices[0].message.content or ''
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f'Error consultando OpenAI: {exc}') from exc


def generate_chat_response(message: str) -> dict:
    response_text = _chat_completion(message)
    return {
        'provider': 'openai',
        'model': OPENAI_MODEL,
        'input': message,
        'response': response_text,
    }


def generate_daily_recommendation(payload: DailyRecommendationRequest) -> dict:
    savings_gap = max(payload.planned_investment - payload.saved_this_month, 0)
    prompt = (
        f"Usuario: {payload.user_name}. "
        f"Control de gasto hoy: {payload.spending_control}. "
        f"Acción de ahorro hoy: {payload.savings_action}. "
        f"Acción de deuda hoy: {payload.debt_action}. "
        f"Inversión planificada del mes: {payload.planned_investment:.2f} {payload.currency}. "
        f"Ahorrado este mes: {payload.saved_this_month:.2f} {payload.currency}. "
        f"Faltante estimado de ahorro: {savings_gap:.2f} {payload.currency}. "
        f"Deuda pendiente: {payload.pending_debt_total:.2f} {payload.currency}. "
        'Genera una recomendación breve, accionable y empática para hoy con 3 pasos concretos.'
    )
    response_text = _chat_completion(prompt)
    return {
        'provider': 'openai',
        'model': OPENAI_MODEL,
        'recommendation': response_text,
        'input': payload.model_dump(),
    }
