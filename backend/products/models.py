import uuid

from django.conf import settings
from django.db import models

from organizations.models import Organization


class Product(models.Model):
    CATEGORY_CHOICES = (
        ("produce", "Produce"),
        ("meat", "Meat"),
        ("dairy", "Dairy"),
        ("other", "Other"),
    )
    SURPLUS_REASON_CHOICES = (
        ("excess", "Excess Inventory"),
        ("imperfect", "Cosmetically Imperfect"),
        ("urgent", "Urgent Sale Needed"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="produce")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)
    location = models.CharField(max_length=255, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    available = models.BooleanField(default=True)

    is_surplus = models.BooleanField(default=False)
    surplus_reason = models.CharField(max_length=20, choices=SURPLUS_REASON_CHOICES, blank=True, null=True)
    discount_percentage = models.IntegerField(blank=True, null=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name
