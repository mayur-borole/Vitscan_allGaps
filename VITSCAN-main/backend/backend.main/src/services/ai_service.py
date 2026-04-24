from google import genai
from google.genai import types

from src.config.settings import get_settings
from src.prompts.ai_prompts import ANALYZE_IMAGES_PROMPT, CHAT_SYSTEM_PROMPT


class AIService:
    def __init__(self) -> None:
        settings = get_settings()
        self.model_id = settings.gemini_model_id
        self.client = genai.Client(api_key=settings.gemini_api_key)

    def analyze_images(self, image_payloads: list[tuple[bytes, str]], extra_prompt: str | None = None) -> str:
        prompt = ANALYZE_IMAGES_PROMPT if not extra_prompt else f"{ANALYZE_IMAGES_PROMPT}\n\nUser focus: {extra_prompt}"
        parts: list[types.Part] = [types.Part.from_text(text=prompt)]

        for data, mime_type in image_payloads:
            parts.append(types.Part.from_bytes(data=data, mime_type=mime_type))

        response = self.client.models.generate_content(
            model=self.model_id,
            contents=parts,
        )
        return response.text or "No analysis generated."

    def chat(self, message: str, context: str | None = None) -> str:
        prompt = CHAT_SYSTEM_PROMPT
        if context:
            prompt += f"\n\nContext: {context}"

        response = self.client.models.generate_content(
            model=self.model_id,
            contents=f"{prompt}\n\nUser: {message}",
        )
        return response.text or "No response generated."
