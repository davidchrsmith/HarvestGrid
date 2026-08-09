import uuid

from django.conf import settings
from django.db import models

from organizations.models import Organization
from products.models import Product


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="messages_sent")
    to_organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="messages_received")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.subject
