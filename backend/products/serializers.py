from rest_framework import serializers

from organizations.models import Organization
from .models import Product


class ProductOrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "type", "description", "location"]


class ProductSerializer(serializers.ModelSerializer):
    organization = ProductOrganizationSerializer(read_only=True)
    organization_id = serializers.PrimaryKeyRelatedField(
        source="organization", queryset=Organization.objects.all(), write_only=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "organization",
            "organization_id",
            "name",
            "description",
            "category",
            "price",
            "quantity",
            "unit",
            "location",
            "image_url",
            "available",
            "is_surplus",
            "surplus_reason",
            "discount_percentage",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_by", "created_at"]
