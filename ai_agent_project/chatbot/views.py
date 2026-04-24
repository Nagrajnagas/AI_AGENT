from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services.llm import run_agent
from .services.memory import get_time

@api_view(['POST'])
def chat(request):
    try:
        user_message = request.data.get('message')

        if not user_message:
            return Response({"response": "Empty input"}, status=400)

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