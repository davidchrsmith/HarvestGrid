from rest_framework import serializers

from organizations.models import Organization
from organizations.serializers import OrganizationReliabilitySerializer, OrganizationSerializer
from .models import DemandOffer, DemandRequest


class DemandRequestSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    organization_id = serializers.PrimaryKeyRelatedField(
        source="organization", queryset=Organization.objects.all(), write_only=True
    )

    class Meta:
        model = DemandRequest
        fields = [
            "id",
            "organization",
            "organization_id",
            "product_name",
            "category",
            "quantity",
            "unit",
            "description",
            "frequency",
            "start_date",
            "end_date",
            "preferred_radius_miles",
            "status",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "status"]


class DemandOfferFarmSerializer(serializers.ModelSerializer):
    reliability = OrganizationReliabilitySerializer(read_only=True)

    class Meta:
        model = Organization
        fields = ["id", "name", "location", "reliability"]


class DemandOfferSerializer(serializers.ModelSerializer):
    farm = DemandOfferFarmSerializer(source="farm_organization", read_only=True)
    farm_organization_id = serializers.PrimaryKeyRelatedField(
        source="farm_organization", queryset=Organization.objects.all(), write_only=True
    )

    class Meta:
        model = DemandOffer
        fields = [
            "id",
            "demand_request",
            "farm",
            "farm_organization_id",
            "offered_quantity",
            "offered_price",
            "message",
            "status",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_by", "created_at"]
