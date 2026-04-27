import datetime
import requests
from django.conf import settings

def get_time():
    return str(datetime.datetime.now())


def calculator(expression):
    try:
        return eval(expression)
    except Exception:
        return "Invalid expression"

def get_weather_report(city="Bengaluru"):
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={settings.WEATHER_API_KEY}&units=metric"
    now = datetime.now().strftime("%I:%M %p")
    try:
        res = requests.get(url)
        data = res.json()

        return {
            "type": "weather",   
            "data": {
                "city": data["name"],
                "temp": round(data["main"]["temp"]),
                "description": data["weather"][0]["description"],
                "humidity": data["main"]["humidity"],
                "wind": data["wind"]["speed"]
            },
            "summary": f"""
### 🌥️ Weather in {data["name"]}
🕒 **Time:** {now}

- 🌡️ Temperature: **{round(data["main"]["temp"])}°C**
- 💭 Condition: **{data["weather"][0]["description"]}**
- 💧 Humidity: **{data["main"]["humidity"]}%**
- 💨 Wind: **{data["wind"]["speed"]} m/s**
"""
        }

    except Exception as e:
        return {
            "type": "error",
            "response": str(e)
        }