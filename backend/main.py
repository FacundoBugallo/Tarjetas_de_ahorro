import os
from typing import Literal

from fastapi import FastAPI, HTTPException
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


class ChatResponse(BaseModel):
    provider: str
    model: str
    input: str
    response: str


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
