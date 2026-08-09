import uuid

from django.conf import settings
from django.db import models

from demand.models import DemandOffer, DemandRequest
from organizations.models import Organization


class Commitment(models.Model):
    STATUS_CHOICES = (
        ("active", "Active"),
        ("paused", "Paused"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    demand_request = models.ForeignKey(DemandRequest, on_delete=models.SET_NULL, null=True, blank=True)
    demand_offer = models.ForeignKey(DemandOffer, on_delete=models.SET_NULL, null=True, blank=True)
    restaurant_organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="commitments_as_restaurant"
    )
    farm_organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="commitments_as_farm")
    product_name = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    frequency = models.CharField(max_length=20)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    next_delivery_date = models.DateField(blank=True, null=True)
    delivery_notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["next_delivery_date"]

    def __str__(self):
        return f"{self.product_name}: {self.restaurant_organization} <-> {self.farm_organization}"


class CommitmentDelivery(models.Model):
    STATUS_CHOICES = (
        ("scheduled", "Scheduled"),
        ("completed", "Completed"),
        ("missed", "Missed"),
        ("cancelled", "Cancelled"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    commitment = models.ForeignKey(Commitment, on_delete=models.CASCADE, related_name="deliveries")
    scheduled_date = models.DateField()
    completed_date = models.DateField(blank=True, null=True)
    quantity_delivered = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")
    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-scheduled_date"]

    def __str__(self):
        return f"Delivery for {self.commitment} on {self.scheduled_date}"
