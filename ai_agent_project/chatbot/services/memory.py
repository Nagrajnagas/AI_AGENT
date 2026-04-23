import datetime

chat_memory = []

def save_message(role, message):
    
    chat_memory.append({
        "role":role,
        "message":message
    })
    
def get_time():
    return datetime.datetime.now().strftime("%A, %B %d, %Y at %I,:%M %p")
    
def get_history():
    history = ""
    
    for msg in chat_memory:
        history += f"{msg['role']}: {msg['message']}\n"
        
    return history