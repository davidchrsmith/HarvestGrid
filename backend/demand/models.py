import uuid

from django.conf import settings
from django.db import models

from organizations.models import Organization


class DemandRequest(models.Model):
    CATEGORY_CHOICES = (
        ("produce", "Produce"),
        ("meat", "Meat"),
        ("dairy", "Dairy"),
        ("other", "Other"),
    )
    FREQUENCY_CHOICES = (
        ("one-time", "One-time"),
        ("weekly", "Weekly"),
        ("bi-weekly", "Bi-weekly"),
        ("monthly", "Monthly"),
        ("seasonal", "Seasonal"),
    )
    STATUS_CHOICES = (
        ("active", "Active"),
        ("fulfilled", "Fulfilled"),
        ("cancelled", "Cancelled"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="demand_requests")
    product_name = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="produce")
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default="one-time")
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    preferred_radius_miles = models.IntegerField(default=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product_name} for {self.organization}"


class DemandOffer(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    demand_request = models.ForeignKey(DemandRequest, on_delete=models.CASCADE, related_name="offers")
    farm_organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="demand_offers")
    offered_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    offered_price = models.DecimalField(max_digits=10, decimal_places=2)
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Offer from {self.farm_organization} on {self.demand_request}"
