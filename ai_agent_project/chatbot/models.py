from django.db import models

# Create your models here.
class ChatMessage(models.Model):
    user_id = models.CharField(max_length=100)  # simple user tracking
    role = models.CharField(max_length=10)      # "user" / "ai"
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_id} - {self.role}"