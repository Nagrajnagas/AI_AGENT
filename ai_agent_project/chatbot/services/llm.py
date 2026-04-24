import os
import requests

def run_agent(prompt):
    api_key = os.environ.get("GROQ_API_KEY")

    if not api_key:
        return "❌ GROQ API key is missing"

    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}]
    }

    try:
        response = requests.post(url, headers=headers, json=payload)

        # 🔥 Print raw response for debugging
        print("STATUS:", response.status_code)
        print("RAW:", response.text)

        data = response.json()

        # Safe access
        return data.get('choices', [{}])[0].get('message', {}).get('content', "⚠️ No response from AI")

    except Exception as e:
        return f"❌ Agent crash: {str(e)}"