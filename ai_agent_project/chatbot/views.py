from rest_framework.decorators import api_view
from rest_framework.response import Response
import re

from .services.llm import run_agent
from .services.memory import save_message, get_history, clear_memory, get_time
from .services.tools import get_weather_report

WEATHER_WORDS = {
    "weather","temperature","climate","forecast","today","now","current",
    "what","is","the","in","of","for","at","please","tell","me","show","give",
}

def extract_weather_location(message):
    cleaned = re.sub(r"[^\w\s,.-]", " ", message.lower())
    words = [word for word in cleaned.split() if word not in WEATHER_WORDS]
    return " ".join(words).strip(" ?.,!")

@api_view(['POST'])
def chat(request):
    try:
        user_message = request.data.get('message', "").strip()
        user_id = request.data.get("user_id", "default_user")  # 🔥 per-user memory

        if not user_message:
            return Response({"response": "Empty input"}, status=400)

        lower_msg = user_message.lower()

        # 🧠 CLEAR MEMORY
        if any(word in lower_msg for word in ["clear", "reset", "clear memory"]):
            clear_memory(user_id)
            return Response({"response": "🧠 Memory cleared successfully."})

        # 🌦 WEATHER
        if any(word in lower_msg for word in ["weather", "temperature", "climate"]):
            location = extract_weather_location(user_message)

            if not location:
                return Response({
                    "type": "error",
                    "response": "Please tell me the city or village name."
                })

            weather = get_weather_report(location)

            return Response(weather)

        # 🕒 TIME
        if "time" in lower_msg:
            return Response({
                "response": f"The current time is {get_time()}"
            })

        # 🧠 SAVE USER MESSAGE (SMART MEMORY handled in memory.py)
        save_message(user_id, "user", user_message)

        # 🧠 GET HISTORY
        history = get_history(user_id)

        # 🤖 BUILD PROMPT WITH MEMORY
        prompt = f"""
You are a helpful AI assistant.

Remember important user details like name, location, preferences.

Conversation:
{history}

USER: {user_message}
AI:
"""

        # 🤖 RUN AI
        ai_response = run_agent(prompt)

        # 🧠 SAVE AI RESPONSE
        save_message(user_id, "ai", ai_response)

        return Response({"response": ai_response})

    except Exception as e:
        print("ERROR:", str(e))
        return Response({"response": "⚠️ Server error. Try again."}, status=500)
