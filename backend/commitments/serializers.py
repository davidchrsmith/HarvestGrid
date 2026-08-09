from rest_framework import serializers

from organizations.models import Organization
from .models import Commitment, CommitmentDelivery


class CommitmentOrgSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "location"]


class CommitmentSerializer(serializers.ModelSerializer):
    restaurant = CommitmentOrgSerializer(source="restaurant_organization", read_only=True)
    farm = CommitmentOrgSerializer(source="farm_organization", read_only=True)

    restaurant_organization_id = serializers.PrimaryKeyRelatedField(
        source="restaurant_organization", queryset=Organization.objects.all(), write_only=True
    )
    farm_organization_id = serializers.PrimaryKeyRelatedField(
        source="farm_organization", queryset=Organization.objects.all(), write_only=True
    )

    class Meta:
        model = Commitment
        fields = [
            "id",
            "demand_request",
            "demand_offer",
            "restaurant",
            "farm",
            "restaurant_organization_id",
            "farm_organization_id",
            "product_name",
            "quantity",
            "unit",
            "price",
            "frequency",
            "start_date",
            "end_date",
            "next_delivery_date",
            "delivery_notes",
            "status",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_by", "created_at"]


class CommitmentDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = CommitmentDelivery
        fields = [
            "id",
            "commitment",
            "scheduled_date",
            "completed_date",
            "quantity_delivered",
            "status",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
