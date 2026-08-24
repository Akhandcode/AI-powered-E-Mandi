import hashlib
import hmac
import os
import json
import base64
import time
from datetime import datetime, timedelta
from typing import Optional

from app.config.settings import settings


def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')


def base64url_decode(data_str: str) -> bytes:
    padding = '=' * (4 - (len(data_str) % 4))
    return base64.urlsafe_b64decode(data_str + padding)


def hash_password(password: str) -> str:
    """Secure salt + PBKDF2 HMAC SHA-256 password hashing."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        100_000
    )
    return salt.hex() + '$' + key.hex()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against salt+key hash."""
    try:
        parts = hashed_password.split('$')
        if len(parts) != 2:
            return False
        salt = bytes.fromhex(parts[0])
        expected_key = bytes.fromhex(parts[1])
        key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt,
            100_000
        )
        return hmac.compare_digest(key, expected_key)
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Pure Python HMAC-SHA256 JWT access token generator."""
    header = {"alg": "HS256", "typ": "JWT"}
    header_json = json.dumps(header, separators=(',', ':')).encode('utf-8')
    header_b64 = base64url_encode(header_json)

    to_encode = data.copy()
    if expires_delta:
        expire_time = int((datetime.utcnow() + expires_delta).timestamp())
    else:
        expire_time = int((datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)).timestamp())

    to_encode.update({"exp": expire_time})
    payload_json = json.dumps(to_encode, separators=(',', ':')).encode('utf-8')
    payload_b64 = base64url_encode(payload_json)

    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(settings.jwt_secret.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig_b64 = base64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> Optional[dict]:
    """Pure Python HMAC-SHA256 JWT access token decoder & validator."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None

        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = hmac.new(settings.jwt_secret.encode('utf-8'), signing_input, hashlib.sha256).digest()
        actual_sig = base64url_decode(sig_b64)

        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        payload_bytes = base64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode('utf-8'))

        exp = payload.get("exp")
        if exp and time.time() > exp:
            return None

        return payload
    except Exception:
        return None
