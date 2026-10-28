import html
import time
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds essential HTTP security headers to all HTTP responses."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # CSP: Allow self, inline styles/scripts necessary for lightweight vanilla client
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "script-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "connect-src 'self';"
        )
        return response

class SimpleRateLimiter:
    """Zero-dependency in-memory sliding-window rate limiter."""
    def __init__(self, max_requests: int = 30, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def is_rate_limited(self, client_ip: str) -> bool:
        now = time.time()
        window_start = now - self.window_seconds
        
        # Clean expired timestamps
        timestamps = [t for t in self.requests[client_ip] if t > window_start]
        self.requests[client_ip] = timestamps
        
        if len(timestamps) >= self.max_requests:
            return True
            
        self.requests[client_ip].append(now)
        return False

# Global rate limiter instances:
# 40 requests per minute for public form submissions
submission_limiter = SimpleRateLimiter(max_requests=40, window_seconds=60)

def verify_rate_limit(request: Request):
    """Enforce rate limits on write endpoints."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    if submission_limiter.is_rate_limited(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please wait a moment before trying again."
        )

def verify_admin_token(token: str) -> bool:
    """Verifies that the provided token matches the secure server ADMIN_TOKEN."""
    if not token or token.strip() != settings.ADMIN_TOKEN.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing administrative authorization token."
        )
    return True

def sanitize_string(text: str) -> str:
    """Escapes potentially dangerous HTML in text input to prevent XSS."""
    if not text:
        return ""
    # Strip dangerous characters and escape HTML entities
    return html.escape(text.strip())

