import requests
from django.conf import settings
from datetime import datetime

def get_time():
    return str(datetime.now())


def calculator(expression):
    try:
        return eval(expression)
    except Exception:
        return "Invalid expression"


def build_location_queries(location):
    cleaned = " ".join(location.replace(",", " ").split())
    if not cleaned:
        return []

    words = cleaned.split()
    queries = [cleaned]

    if len(words) > 1:
        queries.append(",".join(words))
        queries.append(f"{','.join(words)},IN")

    queries.append(f"{cleaned},IN")

    return list(dict.fromkeys(queries))


def find_place(location):
    for query in build_location_queries(location):
        geo_res = requests.get(
            "https://api.openweathermap.org/geo/1.0/direct",
            params={
                "q": query,
                "limit": 1,
                "appid": settings.WEATHER_API_KEY,
            },
            timeout=10,
        )
        geo_res.raise_for_status()
        geo_data = geo_res.json()

        if geo_data:
            return geo_data[0]

    return None


def get_weather_report(location):
    if not settings.WEATHER_API_KEY:
        return {
            "type": "error",
            "response": "Weather API key is missing"
        }

    now = datetime.now().strftime("%I:%M %p")
    try:
        place = find_place(location)

        if not place:
            return {
                "type": "error",
                "response": f"I couldn't find weather for '{location}'. Try adding district, state, or country."
            }

        weather_res = requests.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={
                "lat": place["lat"],
                "lon": place["lon"],
                "appid": settings.WEATHER_API_KEY,
                "units": "metric",
            },
            timeout=10,
        )
        weather_res.raise_for_status()
        data = weather_res.json()

        place_name = place.get("name") or data["name"]
        state = place.get("state")
        country = place.get("country")
        display_name = ", ".join(part for part in [place_name, state, country] if part)

        return {
            "type": "weather",   
            "data": {
                "city": display_name,
                "temp": round(data["main"]["temp"]),
                "description": data["weather"][0]["description"],
                "humidity": data["main"]["humidity"],
                "wind": data["wind"]["speed"]
            },
            "summary": f"""
### 🌥️ Weather in {display_name}
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
