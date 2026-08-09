import uuid

from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models


class Organization(models.Model):
    TYPE_CHOICES = (
        ("farm", "Farm"),
        ("restaurant", "Restaurant"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)

    delivery_days = ArrayField(
        models.CharField(max_length=20), blank=True, default=list
    )
    pickup_available = models.BooleanField(default=False)
    delivery_notes = models.TextField(blank=True, null=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="organizations_created"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class OrganizationMember(models.Model):
    ROLE_CHOICES = (
        ("owner", "Owner"),
        ("member", "Member"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="organization_memberships")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="member")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("organization", "user")

    def __str__(self):
        return f"{self.user} @ {self.organization} ({self.role})"


class OrganizationReliability(models.Model):
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE, related_name="reliability")
    active_partnerships = models.IntegerField(default=0)
    total_commitments = models.IntegerField(default=0)
    completed_commitments = models.IntegerField(default=0)
    total_deliveries = models.IntegerField(default=0)
    on_time_deliveries = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Reliability for {self.organization}"
