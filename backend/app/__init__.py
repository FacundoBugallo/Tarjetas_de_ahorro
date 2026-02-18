from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.ai import router as ai_router
from app.routers.debts import router as debts_router
from app.routers.health import router as health_router


def create_app() -> FastAPI:
    app = FastAPI(title='Tarjetas de ahorro/deuda API', version='0.2.0')

    app.add_middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )

    app.include_router(health_router)
    app.include_router(debts_router)
    app.include_router(ai_router)

    return app
