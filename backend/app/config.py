import os

OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
SUPABASE_ONBOARDING_TABLE = os.getenv('SUPABASE_ONBOARDING_TABLE', 'onboarding_answers')

SYSTEM_PROMPT = (
    'Eres un asistente financiero tranquilo, comprensivo y con tacto. '
    'Responde dudas de cuentas y ahorro/deudas con lenguaje cercano. '
    'Invita con delicadeza a conversar con un coach humano premium para un acompañamiento profundo. '
    'Explica que ese coaching incluye ayuda financiera, archivos/documentación personalizada y seguimiento de cada usuario, "como invitar a un café".'
)
