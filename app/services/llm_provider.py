import logging
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

class LLMProvider:
    """Optional LLM integration provider.
    
    Zero-Cost Guarantee:
    - Disabled by default.
    - Deterministic rules-based engine is always the primary fallback.
    - No API keys required for complete local testing or demonstration.
    """
    def __init__(self):
        self.enabled = settings.ENABLE_OPTIONAL_LLM
        self.provider = settings.LLM_PROVIDER
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.LLM_MODEL

    def is_available(self) -> bool:
        return bool(self.enabled and self.api_key)

    async def generate_enhanced_summary(self, project_title: str, project_description: str) -> Optional[str]:
        """Optionally generates an LLM summary if explicitly enabled and configured."""
        if not self.is_available():
            return None
            
        try:
            import httpx
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a pragmatic senior software architect. Provide a 2-sentence technical risk assessment."
                    },
                    {
                        "role": "user",
                        "content": f"Project: {project_title}\nDescription: {project_description}"
                    }
                ],
                "max_tokens": 150,
                "temperature": 0.3
            }
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    logger.warning(f"LLM API returned status {res.status_code}. Falling back to rules engine.")
                    return None
        except Exception as e:
            logger.warning(f"LLM generation failed ({e}). Gracefully falling back to rules engine.")
            return None

llm_service = LLMProvider()

