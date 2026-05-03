from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ChatMessage
from .services.llm import run_agent
from .services.memory import get_history, get_time

@api_view(["POST"])
def chat(request):
    try:
        user_message = request.data.get("message", "").strip()
        user_id = request.data.get("user_id", "default_user")

        if not user_message:
            return Response({"response": "Empty input"})

        lower = user_message.lower()

        # 🔥 SAVE NAME (STRUCTURED MEMORY)
        if "my name is" in lower:
            name = user_message.split("is")[-1].strip()

            # remove old name
            ChatMessage.objects.filter(
                user_id=user_id,
                role="memory",
                message__startswith="name:"
            ).delete()

            ChatMessage.objects.create(
                user_id=user_id,
                role="memory",
                message=f"name:{name}"
            )

            return Response({
                "response": f"Nice to meet you, {name}. I'll remember your name."
            })

        # 🔥 GET NAME
        if "name" in lower:
            msg = ChatMessage.objects.filter(
                user_id=user_id,
                role="memory",
                message__startswith="name:"
            ).order_by('-created_at').first()

            if msg:
                name = msg.message.replace("name:", "")
                return Response({"response": f"Your name is {name}."})

            return Response({"response": "I don't know your name yet."})

        # NORMAL FLOW
        ChatMessage.objects.create(
            user_id=user_id,
            role="user",
            message=user_message
        )

        history = get_history(user_id)

        prompt = f"""
You are a helpful assistant.

Conversation:
{history}

USER: {user_message}
AI:
"""

        ai_response = run_agent(prompt)

        ChatMessage.objects.create(
            user_id=user_id,
            role="ai",
            message=ai_response
        )

        return Response({"response": ai_response})

    except Exception as e:
        print("ERROR:", e)
        return Response({"response": "Server error"})