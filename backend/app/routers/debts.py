from fastapi import APIRouter

from app.schemas import DebtPlanRequest
from app.services.debt_service import calculate_debt_summary

router = APIRouter(prefix='/api/debts', tags=['debts'])


@router.post('/plan')
def calculate_debt_plan(payload: DebtPlanRequest) -> dict:
    return calculate_debt_summary(
        payment_amount=payload.payment_amount,
        periods=payload.periods,
        cadence=payload.cadence,
    )
