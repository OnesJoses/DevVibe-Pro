from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import json
import os

try:
	from openai import OpenAI  # type: ignore
except Exception:  # pragma: no cover
	OpenAI = None  # fallback so imports don't crash if package missing


@api_view(["POST"])
@permission_classes([AllowAny])
@csrf_exempt
def ask_ai(request):
	"""Proxy endpoint that calls OpenAI server-side using OPENAI_API_KEY.

	Body: {"question": string}
	Returns: {"answer": string}
	"""
	if OpenAI is None:
		return JsonResponse({"message": "OpenAI SDK not installed on server"}, status=500)

	try:
		# Prefer DRF parsing to handle JSON or form data gracefully
		question = None
		try:
			if hasattr(request, "data"):
				q = request.data.get("question")  # type: ignore[attr-defined]
				if isinstance(q, str):
					question = q.strip()
		except Exception:
			pass

		# Fallbacks: traditional POST/GET or raw body JSON
		if not question:
			q = request.POST.get("question") or request.GET.get("question")
			if isinstance(q, str):
				question = q.strip()
		if not question:
			try:
				raw = request.body.decode("utf-8")
				if raw:
					data = json.loads(raw)
					q = data.get("question") if isinstance(data, dict) else None
					if isinstance(q, str):
						question = q.strip()
			except Exception:
				# Ignore raw JSON errors; we'll report missing question below
				pass

		question = question or ""
		if not question:
			return JsonResponse({"message": "Missing 'question'"}, status=400)

		api_key = os.getenv("OPENAI_API_KEY")
		if not api_key:
			return JsonResponse({"message": "OPENAI_API_KEY not configured"}, status=500)

		client = OpenAI(api_key=api_key)

		# Lightweight, cost-effective model. Adjust if you prefer a different one.
		model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

		# You can switch to client.responses.create if desired.
		resp = client.chat.completions.create(
			model=model,
			messages=[
				{"role": "system", "content": "You are a helpful assistant for a developer portfolio website. Be concise, clear, and helpful."},
				{"role": "user", "content": question},
			],
			temperature=0.7,
			max_tokens=400,
		)

		answer = resp.choices[0].message.content if resp and resp.choices else ""
		return JsonResponse({"answer": answer})
	except Exception as e:  # pragma: no cover
		return JsonResponse({"message": f"AI error: {e}"}, status=500)
