from datetime import datetime
from zoneinfo import ZoneInfo
from django.db import DatabaseError
from ai_agent_project.chatbot.models import ChatMessage 

IMPORTANT_KEYWORDS = ["name", "from", "live", "age", "work", "study"]

def is_important(message):
    message = message.lower()
    return any(word in message for word in IMPORTANT_KEYWORDS)

def save_message(user_id, role, message):
    try:
        if role == "user" and not is_important(message):
            return  # skip non-important user messages

        ChatMessage.objects.create(
            user_id=user_id,
            role=role,
            message=message
        )
    except DatabaseError as e:
        print("MEMORY SAVE ERROR:", e)

def get_time():
    try:
        now = datetime.now(ZoneInfo("Asia/Kolkata"))
        return now.strftime("%A, %B %d, %Y at %I:%M %p")
    except Exception as e:
        print("TIME ERROR:", e)
        return "Time unavailable"

def get_history(user_id):
    try:
        messages = ChatMessage.objects.filter(user_id=user_id).order_by('-created_at')[:10][::-1]
        history = ""

        for msg in messages:
            history += f"{msg.role}: {msg.message}\n"
    except DatabaseError as e:
        print("MEMORY HISTORY ERROR:", e)
        return ""

    return history

def clear_memory(user_id):
    try:
        ChatMessage.objects.filter(user_id=user_id).delete()
    except DatabaseError as e:
        print("MEMORY CLEAR ERROR:", e)
