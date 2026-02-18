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
