import time

import jwt
from fastapi import HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

JWT_SECRET = "9EWkLUmV/mnVfqIfdWANd6d4t1bgETk6uN0Q7qKQtqEsq8YZoX3XcUUODblbuRpBmdl/eeYxzRdjDqaJfobU6w=="
JWT_ALGORITHM = "HS256"


def decode_jwt(token: str) -> dict:
    try:
        decoded_token = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            audience="authenticated",
            issuer="https://mkflwauxqqtzegwmuiwi.supabase.co/auth/v1",
        )
        return decoded_token if decoded_token["exp"] >= time.time() else None
    except Exception as e:
        print(e)
        return {}


def verify_jwt(token: str) -> bool:
    is_token_valid: bool = False

    try:
        payload = decode_jwt(token)
    except:  # noqa: E722
        payload = None

    if payload:
        is_token_valid = True
    return is_token_valid


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
            if not verify_jwt(credentials.credentials):
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")

            return decode_jwt(credentials.credentials)
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")
