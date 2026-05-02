import re

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services.llm import run_agent
from .services.memory import (
    clear_memory,
    get_history,
    get_time,
    get_user_name,
    save_message,
)
from .services.tools import get_weather_report

WEATHER_WORDS = {
    "weather",
    "temperature",
    "climate",
    "forecast",
    "today",
    "now",
    "current",
    "what",
    "is",
    "the",
    "in",
    "of",
    "for",
    "at",
    "please",
    "tell",
    "me",
    "show",
    "give",
}


def extract_weather_location(message):
    cleaned = re.sub(r"[^\w\s,.-]", " ", message.lower())
    words = [word for word in cleaned.split() if word not in WEATHER_WORDS]
    return " ".join(words).strip(" ?.,!")


@api_view(["POST"])
def chat(request):
    try:
        if not isinstance(request.data, dict):
            return Response({"response": "Invalid request body"}, status=400)

        user_message = str(request.data.get("message", "")).strip()
        user_id = str(request.data.get("user_id", "default_user")).strip() or "default_user"

        if not user_message:
            return Response({"response": "Empty input"}, status=400)

        lower_msg = user_message.lower()

        if any(word in lower_msg for word in ["clear", "reset", "clear memory"]):
            clear_memory(user_id)
            return Response({"response": "Memory cleared successfully."})

        if any(word in lower_msg for word in ["weather", "temperature", "climate"]):
            location = extract_weather_location(user_message)

            if not location:
                return Response({
                    "type": "error",
                    "response": "Please tell me the city or village name."
                })

            return Response(get_weather_report(location))

        if "time" in lower_msg:
            return Response({
                "response": f"The current time is {get_time()}"
            })

        asks_for_name = any(
            phrase in lower_msg
            for phrase in ["my name", "what is my name", "who am i"]
        )

        if asks_for_name and not re.search(r"\bmy name is\b", lower_msg):
            saved_name = get_user_name(user_id)
            if saved_name:
                return Response({"response": f"Your name is {saved_name}."})

        save_message(user_id, "user", user_message)

        history = get_history(user_id)
        saved_name = get_user_name(user_id)
        known_details = f"User name: {saved_name}" if saved_name else "No known user name yet."

        prompt = f"""
You are a helpful AI assistant.

Remember important user details like name, location, preferences.
Use the known details below when answering memory questions.

Known details:
{known_details}

Conversation:
{history}

USER: {user_message}
AI:
"""

        ai_response = run_agent(prompt)
        save_message(user_id, "ai", ai_response)

        return Response({"response": ai_response})

    except Exception as e:
        print("ERROR:", str(e))
        return Response({"response": "Server error. Try again."}, status=500)
