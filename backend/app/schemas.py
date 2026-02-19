from typing import Literal

from pydantic import BaseModel, Field


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


class DailyRecommendationRequest(BaseModel):
    spending_control: str
    savings_action: str
    debt_action: str
    user_name: str = 'Usuario'
    planned_investment: float = 0
    saved_this_month: float = 0
    pending_debt_total: float = 0
    currency: str = 'COP'


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2)
    email: str
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)


class AuthResponse(BaseModel):
    id: str
    name: str
    email: str


class SaveOnboardingRequest(BaseModel):
    user_id: str = Field(min_length=1)
    meta: str
    ritmo: str
    prioridad: str
    acompanamiento: str
    moneda_base: str


class SaveOnboardingResponse(BaseModel):
    success: bool
