import requests 
OLLAMA_URL = "http://localhost:11434/api/generate"

def ask_llm(prompt):
    payload = {
        "model":"phi",
        "prompt":prompt,
        "stream":False
    }
    
    response = requests.post(OLLAMA_URL, json=payload)
    
    return response.json()["response"]