from datetime import datetime
from zoneinfo import ZoneInfo
from django.db import DatabaseError
from ai_agent_project.chatbot.models import ChatMessage 
import re

NAME_PATTERNS = [
    r"\bmy name is\s+([a-zA-Z][a-zA-Z .'-]{0,40})",
    r"\bcall me\s+([a-zA-Z][a-zA-Z .'-]{0,40})",
]
NAME_STOP_WORDS = {"and", "but", "from", "i", "my"}


def extract_user_name(message):
    for pattern in NAME_PATTERNS:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            words = []
            for word in match.group(1).strip(" .").split():
                if word.lower() in NAME_STOP_WORDS:
                    break
                words.append(word)

            return " ".join(words) or None

    return None

def save_message(user_id, role, message):
    try:
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
        messages = ChatMessage.objects.filter(user_id=user_id).order_by('-created_at')[:20][::-1]
        history = ""

        for msg in messages:
            role = "AI" if msg.role == "ai" else "USER"
            history += f"{role}: {msg.message}\n"
    except DatabaseError as e:
        print("MEMORY HISTORY ERROR:", e)
        return ""

    return history

def get_user_name(user_id):
    try:
        memory_msg = ChatMessage.objects.filter(
            user_id=user_id,
            role="memory",
            message__startswith="name:"
        ).order_by('-created_at').first()

        if memory_msg:
            return memory_msg.message.replace("name:", "").strip()

        messages = ChatMessage.objects.filter(
            user_id=user_id,
            role="user"
        ).order_by('-created_at')[:50]

        for msg in messages:
            name = extract_user_name(msg.message)
            if name:
                return name
    except DatabaseError as e:
        print("MEMORY NAME ERROR:", e)

    return None

def clear_memory(user_id):
    try:
        ChatMessage.objects.filter(user_id=user_id).delete()
    except DatabaseError as e:
        print("MEMORY CLEAR ERROR:", e)
