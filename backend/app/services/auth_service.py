from fastapi import HTTPException
from supabase import Client, create_client

from app.config import SUPABASE_ANON_KEY, SUPABASE_ONBOARDING_TABLE, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL

_supabase_auth_client: Client | None = None
_supabase_admin_client: Client | None = None


def _validate_supabase_env() -> None:
    if not SUPABASE_URL:
        raise HTTPException(status_code=500, detail='Falta configurar SUPABASE_URL en el backend.')
    if not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=500, detail='Falta configurar SUPABASE_ANON_KEY en el backend.')


def _get_auth_client() -> Client:
    global _supabase_auth_client
    _validate_supabase_env()

    if _supabase_auth_client is None:
        _supabase_auth_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

    return _supabase_auth_client


def _get_admin_client() -> Client:
    global _supabase_admin_client
    if not SUPABASE_URL:
        raise HTTPException(status_code=500, detail='Falta configurar SUPABASE_URL en el backend.')
    if not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=500,
            detail='Falta configurar SUPABASE_SERVICE_ROLE_KEY para guardar onboarding.',
        )

    if _supabase_admin_client is None:
        _supabase_admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    return _supabase_admin_client


def init_auth_db() -> None:
    """Se mantiene por compatibilidad con el startup hook."""


def register_user(name: str, email: str, password: str) -> dict:
    normalized_email = email.strip().lower()
    normalized_name = name.strip()

    if not normalized_email:
        raise HTTPException(status_code=400, detail='El email es obligatorio.')
    if not normalized_name:
        raise HTTPException(status_code=400, detail='El nombre es obligatorio.')

    client = _get_auth_client()
    response = client.auth.sign_up(
        {
            'email': normalized_email,
            'password': password,
            'options': {'data': {'name': normalized_name}},
        }
    )

    if not response.user:
        raise HTTPException(status_code=400, detail='No fue posible crear la cuenta en Supabase.')

    return {'id': response.user.id, 'name': normalized_name, 'email': normalized_email}


def login_user(email: str, password: str) -> dict:
    normalized_email = email.strip().lower()
    client = _get_auth_client()

    try:
        response = client.auth.sign_in_with_password({'email': normalized_email, 'password': password})
    except Exception as exc:
        raise HTTPException(status_code=401, detail='Credenciales inválidas.') from exc

    if not response.user:
        raise HTTPException(status_code=401, detail='Credenciales inválidas.')

    profile_name = (response.user.user_metadata or {}).get('name') or normalized_email.split('@')[0]
    return {'id': response.user.id, 'name': profile_name, 'email': normalized_email}


def save_onboarding_answers(user_id: str, meta: str, ritmo: str, prioridad: str, acompanamiento: str, moneda_base: str) -> dict:
    client = _get_admin_client()

    payload = {
        'user_id': user_id,
        'meta': meta,
        'ritmo': ritmo,
        'prioridad': prioridad,
        'acompanamiento': acompanamiento,
        'moneda_base': moneda_base,
    }

    try:
        client.table(SUPABASE_ONBOARDING_TABLE).upsert(payload, on_conflict='user_id').execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail='No pudimos guardar el onboarding en Supabase.') from exc

    return {'success': True}


def get_onboarding_answers(user_id: str) -> dict:
    client = _get_admin_client()

    try:
        response = (
            client
            .table(SUPABASE_ONBOARDING_TABLE)
            .select('meta, ritmo, prioridad, acompanamiento, moneda_base')
            .eq('user_id', user_id)
            .maybe_single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail='No pudimos consultar el onboarding en Supabase.') from exc

    return response.data or {}
