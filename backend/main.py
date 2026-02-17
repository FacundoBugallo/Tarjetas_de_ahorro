import os
from typing import Literal

<<<<<<< codex/add-debt-plan-feature-to-app-kayr5o
from fastapi import FastAPI, HTTPException
=======
from fastapi import FastAPI
>>>>>>> main
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title='Tarjetas de ahorro/deuda API', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


class DebtPlanRequest(BaseModel):
    payment_amount: float = Field(gt=0)
    periods: int = Field(gt=0)
    cadence: Literal['semanal', 'mensual'] = 'mensual'


class ChatRequest(BaseModel):
    message: str


<<<<<<< codex/add-debt-plan-feature-to-app-kayr5o
class ChatResponse(BaseModel):
    provider: str
    model: str
    input: str
    response: str
=======
class DailyRecommendationRequest(BaseModel):
    spending_control: str
    savings_action: str
    debt_action: str
    user_name: str = 'Usuario'
    planned_investment: float = 0
    saved_this_month: float = 0
    pending_debt_total: float = 0
    currency: str = 'COP'
>>>>>>> main


SYSTEM_PROMPT = (
    'Eres un asistente financiero tranquilo, comprensivo y con tacto. '
    'Responde dudas de cuentas y ahorro/deudas con lenguaje cercano. '
    'Invita con delicadeza a conversar con un coach humano premium para un acompañamiento profundo. '
    'Explica que ese coaching incluye ayuda financiera, archivos/documentación personalizada y seguimiento de cada usuario, "como invitar a un café".'
)


@app.get('/health')
def health() -> dict:
    return {'status': 'ok'}


@app.post('/api/debts/plan')
def calculate_debt_plan(payload: DebtPlanRequest) -> dict:
    total_to_pay = payload.payment_amount * payload.periods
    return {
        'payment_amount': payload.payment_amount,
        'periods': payload.periods,
        'cadence': payload.cadence,
        'total_to_pay': total_to_pay,
        'summary': f'A pagar para cancelar: {total_to_pay:.2f}',
    }


<<<<<<< codex/add-debt-plan-feature-to-app-kayr5o
@app.post('/api/ai/chat', response_model=ChatResponse)
def ai_chat(payload: ChatRequest) -> ChatResponse:
    model = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
    api_key = os.getenv('OPENAI_API_KEY')

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail='Falta OPENAI_API_KEY en variables de entorno del backend.',
        )

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': payload.message},
            ],
            temperature=0.5,
        )
        response_text = completion.choices[0].message.content or ''
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f'Error consultando OpenAI: {exc}') from exc

    return ChatResponse(
        provider='openai',
        model=model,
        input=payload.message,
        response=response_text,
    )
=======
@app.post('/api/ai/chat')
def ai_chat(payload: ChatRequest) -> dict:
    model = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')

    # Aquí puedes conectar el SDK de OpenAI real cuando agregues OPENAI_API_KEY.
    # Se deja una respuesta estable para desarrollo local de la app.
    response_text = (
        'Te acompaño con calma: revisa primero tus gastos fijos y define un monto sostenible por periodo. '
        'Si quieres, te invito a un café para contarte del coaching premium con seguimiento personalizado.'
    )

    return {
        'provider': 'openai',
        'model': model,
        'system_prompt': SYSTEM_PROMPT,
        'input': payload.message,
        'response': response_text,
    }


@app.post('/api/ai/daily-recommendation')
def daily_recommendation(payload: DailyRecommendationRequest) -> dict:
    model = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
    savings_gap = max(payload.planned_investment - payload.saved_this_month, 0)

    recommendation_parts = [
        f"{payload.user_name}, buen trabajo por reportar tu día.",
        f"Hoy me dices que para controlar gastos: {payload.spending_control}.",
        f"También avanzaste en ahorro con: {payload.savings_action}.",
        f"Y en deudas con: {payload.debt_action}.",
    ]

    if payload.pending_debt_total > 0:
        recommendation_parts.append(
            f"Prioriza una micro-cuota extra a la deuda más cara. Saldo pendiente estimado: {payload.pending_debt_total:.2f} {payload.currency}."
        )
    else:
        recommendation_parts.append('No tienes deuda pendiente registrada: enfoca ese flujo en construir colchón de emergencia.')

    if savings_gap > 0:
        recommendation_parts.append(
            f"Para tu meta mensual, te faltan {savings_gap:.2f} {payload.currency}. Divide este faltante por días para un objetivo diario sostenible."
        )
    else:
        recommendation_parts.append('¡Ya cumpliste tu meta de ahorro mensual! Mantén la constancia con aportes pequeños.')

    recommendation_parts.append(
        'Plan IA de hoy: 1) evita un gasto impulsivo, 2) separa un monto fijo para ahorro, 3) paga una parte de la deuda antes de terminar el día.'
    )

    return {
        'provider': 'openai',
        'model': model,
        'recommendation': ' '.join(recommendation_parts),
        'input': payload.model_dump(),
    }
>>>>>>> main
