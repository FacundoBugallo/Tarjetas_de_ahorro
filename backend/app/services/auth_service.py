import hashlib
import hmac
import os
import sqlite3
from datetime import datetime
from pathlib import Path

from fastapi import HTTPException

BASE_DIR = Path(__file__).resolve().parents[2]
DB_PATH = BASE_DIR / 'data.sqlite3'


def _get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_auth_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with _get_connection() as conn:
        conn.execute(
            '''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                password_salt TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            '''
        )
        conn.execute(
            '''
            CREATE TABLE IF NOT EXISTS onboarding_answers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                meta TEXT NOT NULL,
                ritmo TEXT NOT NULL,
                prioridad TEXT NOT NULL,
                acompanamiento TEXT NOT NULL,
                moneda_base TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(user_id),
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
            '''
        )


def _hash_password(password: str, salt: str) -> str:
    return hashlib.sha256(f'{salt}{password}'.encode('utf-8')).hexdigest()


def register_user(name: str, email: str, password: str) -> dict:
    normalized_email = email.strip().lower()
    if not normalized_email:
        raise HTTPException(status_code=400, detail='El email es obligatorio.')

    salt = os.urandom(16).hex()
    password_hash = _hash_password(password, salt)
    now = datetime.utcnow().isoformat()

    with _get_connection() as conn:
        existing = conn.execute('SELECT id FROM users WHERE email = ?', (normalized_email,)).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail='Ya existe una cuenta con ese email.')

        cursor = conn.execute(
            'INSERT INTO users (name, email, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?)',
            (name.strip(), normalized_email, password_hash, salt, now),
        )
        user_id = cursor.lastrowid

    return {'id': user_id, 'name': name.strip(), 'email': normalized_email}


def login_user(email: str, password: str) -> dict:
    normalized_email = email.strip().lower()
    with _get_connection() as conn:
        row = conn.execute(
            'SELECT id, name, email, password_hash, password_salt FROM users WHERE email = ?',
            (normalized_email,),
        ).fetchone()

    if row is None:
        raise HTTPException(status_code=401, detail='Credenciales inválidas.')

    calculated_hash = _hash_password(password, row['password_salt'])
    if not hmac.compare_digest(calculated_hash, row['password_hash']):
        raise HTTPException(status_code=401, detail='Credenciales inválidas.')

    return {'id': row['id'], 'name': row['name'], 'email': row['email']}


def save_onboarding_answers(user_id: int, meta: str, ritmo: str, prioridad: str, acompanamiento: str, moneda_base: str) -> dict:
    now = datetime.utcnow().isoformat()

    with _get_connection() as conn:
        user_exists = conn.execute('SELECT id FROM users WHERE id = ?', (user_id,)).fetchone()
        if not user_exists:
            raise HTTPException(status_code=404, detail='Usuario no encontrado.')

        conn.execute(
            '''
            INSERT INTO onboarding_answers (user_id, meta, ritmo, prioridad, acompanamiento, moneda_base, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                meta = excluded.meta,
                ritmo = excluded.ritmo,
                prioridad = excluded.prioridad,
                acompanamiento = excluded.acompanamiento,
                moneda_base = excluded.moneda_base,
                updated_at = excluded.updated_at
            ''',
            (user_id, meta, ritmo, prioridad, acompanamiento, moneda_base, now, now),
        )

    return {'success': True}
