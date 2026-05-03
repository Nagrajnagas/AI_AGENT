from django.test import TestCase
from rest_framework.test import APIRequestFactory

from ai_agent_project.chatbot.models import ChatMessage
from ai_agent_project.chatbot.views import chat


class ChatMemoryTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

    def post_chat(self, message, user_id="test-user"):
        request = self.factory.post(
            "/chat/",
            {"message": message, "user_id": user_id},
            format="json",
        )
        return chat(request)

    def test_remembers_name_when_user_asks_name_shorthand(self):
        response = self.post_chat("my name is nagaraj")

        self.assertEqual(response.status_code, 200)
        self.assertIn("nagaraj", response.data["response"])

        response = self.post_chat("name")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["response"], "Your name is nagaraj.")

    def test_memory_is_scoped_by_user_id(self):
        self.post_chat("my name is nagaraj", user_id="first-user")

        response = self.post_chat("name", user_id="second-user")

        self.assertEqual(response.status_code, 200)
        self.assertIn("don't know your name", response.data["response"])

    def test_saves_ordinary_user_messages_for_context(self):
        self.post_chat("my name is nagaraj")
        self.post_chat("I like building AI apps")

        self.assertTrue(
            ChatMessage.objects.filter(
                user_id="test-user",
                role="user",
                message="I like building AI apps",
            ).exists()
        )
