from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services.llm import run_agent
from .services.memory import get_time
from .services.tools import get_weather_report

@api_view(['POST'])
def chat(request):
    try:
        user_message = request.data.get('message', "").lower()

        if not user_message.lower():
            return Response({"response": "Empty input"}, status=400)

        if any(word in user_message for word in ["weather", "temperature", "climate"]):
            return Response(get_weather_report())

        now = get_time()

        # 🔥 DISABLED VECTOR DB (fixes crash)
        context = ""

        prompt = f"""
        CURRENT_TIME: {now}
        USER: {user_message}
        """

        ai_response = run_agent(prompt)

        return Response({"response": ai_response})

    except Exception as e:
        print(f"CRASH LOG: {str(e)}")
        return Response({"error": str(e)}, status=500)
