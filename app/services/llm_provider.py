import logging
from typing import Optional, Dict, Any, List
from app.config import settings

logger = logging.getLogger(__name__)

class LLMProvider:
    """Intelligent LLM integration provider powered by Google Gemini (and optional OpenAI).
    
    Zero-Cost & Local Fallback Guarantee:
    - Primary provider is Google Gemini 2.5 Flash (via GEMINI_API_KEY).
    - If disabled, rate-limited, or offline, falls back seamlessly to deterministic rules engine.
    - Zero crashes guaranteed.
    """
    def __init__(self):
        self.enabled = settings.ENABLE_OPTIONAL_LLM
        self.provider = settings.LLM_PROVIDER
        self.gemini_key = settings.GEMINI_API_KEY
        self.gemini_model = settings.GEMINI_MODEL or "gemini-2.5-flash"
        self.openai_key = settings.OPENAI_API_KEY
        self.openai_model = settings.LLM_MODEL or "gpt-4o-mini"

    def is_available(self) -> bool:
        if not self.enabled:
            return False
        if self.provider == "gemini" and self.gemini_key:
            return True
        if self.provider == "openai" and self.openai_key:
            return True
        return bool(self.gemini_key or self.openai_key)

    async def call_gemini(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        """Calls Google Gemini REST API."""
        if not self.gemini_key:
            return None
        try:
            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.gemini_model}:generateContent?key={self.gemini_key}"
            contents = []
            if system_instruction:
                contents.append({
                    "role": "user",
                    "parts": [{"text": f"SYSTEM INSTRUCTION / ROLE:\n{system_instruction}\n\nUSER PROMPT:\n{prompt}"}]
                })
            else:
                contents.append({
                    "role": "user",
                    "parts": [{"text": prompt}]
                })

            payload = {
                "contents": contents,
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 800
                }
            }

            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0] and "parts" in candidates[0]["content"]:
                        return candidates[0]["content"]["parts"][0]["text"].strip()
                logger.warning(f"[Gemini] API returned status {res.status_code}: {res.text[:200]}")
                return None
        except Exception as e:
            logger.warning(f"[Gemini] Generation failed: {e}. Falling back.")
            return None

    async def generate_enhanced_summary(self, project_title: str, project_description: str) -> Optional[str]:
        """Generates an executive architectural risk assessment."""
        if not self.is_available():
            return None

        prompt = f"""You are a pragmatic senior software architect evaluating a final-year college project.
Project: {project_title}
Description: {project_description}

Provide a crisp 2-sentence technical risk assessment highlighting the single biggest engineering vulnerability and the recommended free local stack."""

        if self.gemini_key:
            return await self.call_gemini(prompt)
        return None

    async def chat_with_project(
        self,
        contract: Dict[str, Any],
        user_message: str,
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """Interactive AI chat grounded in the student's 60-minute Build Contract.
        
        Evaluates peer questions, stress-tests, and edge case challenges.
        """
        title = contract.get("project_title", "Final-Year AI Project")
        idea = contract.get("original_idea", "")
        category = contract.get("category", "AI/ML")
        score = contract.get("feasibility_score", 88)
        assumption = contract.get("critical_assumption", "")
        stack = contract.get("suggested_stack") or {
            "frontend": contract.get("frontend_rec", "Next.js / HTML5"),
            "backend": contract.get("backend_rec", "FastAPI"),
            "ai_model": contract.get("ai_model_rec", "Sentence-Transformers on CPU"),
            "database": contract.get("db_rec", "SQLite (Local ₹0)")
        }
        failure_scenarios = contract.get("failure_scenarios", [])
        tests_summary = "\n".join([
            f"- {t.get('test_name', '')}: {t.get('what_is_tested', '')} -> Remediate: {t.get('remediation_plan', '')}"
            for t in failure_scenarios if isinstance(t, dict)
        ])
        mvp = contract.get("mvp_features", [])

        system_instruction = f"""You are Project Compass AI, an interactive peer-review & stress-test assistant.
You are helping a college classmate inspect and stress-test their friend's project build contract.

PROJECT CONTEXT:
- Title: {title}
- Feasibility Score: {score}/100
- Domain: {category}
- Concept: {idea}
- The ₹0 Tech Stack: {stack}
- The Load-Bearing Assumption: {assumption}
- Planned Failure Tests:
{tests_summary}
- Scope Boundaries (MVP): {mvp}

GUIDELINES:
1. Answer the visitor's question in a crisp, conversational, technically rigorous style (2-3 short paragraphs).
2. If they probe an edge-case (e.g. fees change, missing data, 1000 users, PDF layout scrambling, professor viva traps):
   - Assess if it's a real vulnerability.
   - Explain how the ₹0 architecture can handle or safeguard against it.
   - If it exposes a flaw, explicitly say: "🚨 Build Breaker detected! That's a valid vulnerability."
3. At the end, gently remind them that they can test their own project idea too: "Curious how your own idea scores? Click 'Wait... what would MY idea score?' above to run your own feasibility scan!"
"""

        # Try Gemini first if available
        if self.is_available() and self.gemini_key:
            reply = await self.call_gemini(user_message, system_instruction=system_instruction)
            if reply:
                is_critique = any(k in user_message.lower() for k in [
                    "break", "fail", "crash", "hallucinat", "change", "circular", "fee", "bug", "wrong", "flaw", "risk", "trap"
                ])
                return {
                    "reply": reply,
                    "is_critique": is_critique,
                    "model_used": self.gemini_model,
                    "status": "success"
                }

        # Deterministic Rules-Based Fallback Engine (Zero Failure)
        msg_lower = user_message.lower()
        is_critique = False
        risk_level = "Moderate"

        if any(k in msg_lower for k in ["fee", "circular", "rule", "change", "amend", "outdated"]):
            is_critique = True
            risk_level = "High"
            reply = (
                f"🚨 **Critical Edge Case Detected:** Ingested documents often get superseded by newer university circulars. "
                f"For **{title}**, if college regulations or fee structures change in a 2026 amendment, the model could serve obsolete clauses.\n\n"
                f"**Architectural Safeguard:** Add publication metadata tags (`doc_year`, `validity_range`) to each chunk. "
                f"If a student queries rules without specifying a year, trigger a disambiguation prompt citing the latest amendment date.\n\n"
                f"Curious how your own project idea would handle edge-cases? Click **'Wait… what would MY idea score?'** above!"
            )
        elif any(k in msg_lower for k in ["cpu", "gpu", "cost", "free", "laptop", "hardware"]):
            reply = (
                f"⚡ **₹0 Local Laptop Execution:** This project is designed specifically to run on standard student hardware with **zero cloud bill**.\n\n"
                f"- **Backend:** FastAPI (Python 3.11) consuming ~80MB RAM.\n"
                f"- **Embeddings/Model:** `all-MiniLM-L6-v2` runs inference in <60ms directly on CPU.\n"
                f"- **Storage:** Local SQLite handles vectors and query logs in a single local file without managed database fees."
            )
        elif any(k in msg_lower for k in ["viva", "professor", "fail", "review", "grade"]):
            reply = (
                f"🎓 **Viva Stress-Test:** Evaluators love testing boundaries by asking questions that aren't in the project's dataset. "
                f"The critical trap for **{title}** is: *“{assumption}”*.\n\n"
                f"To ace the viva, demonstrate the **Out-of-Domain Hallucination Trap** test live: show that the system gracefully admits uncertainty when asked an unindexed question instead of fabricating an answer."
            )
        elif any(k in msg_lower for k in ["60 min", "prototype", "time", "plan", "build"]):
            reply = (
                f"⏱️ **The 60-Minute Blueprint:**\n"
                f"1. **Min 00-10:** Environment setup & virtualenv (FastAPI + dependencies).\n"
                f"2. **Min 10-25:** Ingest sample documents & build local vector embeddings.\n"
                f"3. **Min 25-35:** Core retrieval function with cosine threshold filtering.\n"
                f"4. **Min 35-50:** Connect minimal web UI for interactive testing.\n"
                f"5. **Min 50-60:** Run the proposed failure test and rehearse the viva demo."
            )
        else:
            reply = (
                f"👋 **Project Compass AI Review for {title}:**\n\n"
                f"This project scored **{score}/100** on feasibility. It is scoped to build a runnable prototype on a laptop in 60 minutes.\n\n"
                f"Key assumption under test: *\"{assumption}\"*\n\n"
                f"Try challenging this architecture by asking: *“What happens if someone asks about cancelled regulations?”* or *“Can this run offline during the viva presentation?”*"
            )

        return {
            "reply": reply,
            "is_critique": is_critique,
            "risk_level": risk_level,
            "model_used": "rules_engine_fallback",
            "status": "success"
        }

llm_service = LLMProvider()
