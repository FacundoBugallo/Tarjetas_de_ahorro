from fastapi import APIRouter

from app.schemas import ChatRequest, ChatResponse, DailyRecommendationRequest
from app.services.openai_service import generate_chat_response, generate_daily_recommendation

router = APIRouter(prefix='/api/ai', tags=['ai'])


@router.post('/chat', response_model=ChatResponse)
def ai_chat(payload: ChatRequest) -> dict:
    return generate_chat_response(payload.message)


@router.post('/daily-recommendation')
def daily_recommendation(payload: DailyRecommendationRequest) -> dict:
    return generate_daily_recommendation(payload)
