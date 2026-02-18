from fastapi import APIRouter

from app.schemas import AuthResponse, LoginRequest, RegisterRequest, SaveOnboardingRequest, SaveOnboardingResponse
from app.services.auth_service import login_user, register_user, save_onboarding_answers

router = APIRouter(prefix='/api/auth', tags=['auth'])


@router.post('/register', response_model=AuthResponse)
def register(payload: RegisterRequest) -> dict:
    return register_user(payload.name, payload.email, payload.password)


@router.post('/login', response_model=AuthResponse)
def login(payload: LoginRequest) -> dict:
    return login_user(payload.email, payload.password)


@router.post('/onboarding', response_model=SaveOnboardingResponse)
def save_onboarding(payload: SaveOnboardingRequest) -> dict:
    return save_onboarding_answers(
        user_id=payload.user_id,
        meta=payload.meta,
        ritmo=payload.ritmo,
        prioridad=payload.prioridad,
        acompanamiento=payload.acompanamiento,
        moneda_base=payload.moneda_base,
    )
