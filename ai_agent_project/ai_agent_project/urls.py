from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("Django is working ✅")


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home),
    path('', include('ai_agent_project.chatbot.urls')), # This connects your chatbot app's URLs
]