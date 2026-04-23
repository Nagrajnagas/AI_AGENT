from django.urls import path
from .views import chat # Adjust 'chatbot' to your app name

urlpatterns = [
    # Option A: Root level
    path('chat/', chat, name='chat'), 
]