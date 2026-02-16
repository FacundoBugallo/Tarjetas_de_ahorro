import os
from typing import Literal

from fastapi import FastAPI
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
