from rest_framework import serializers

from organizations.models import Organization
from products.models import Product
from .models import Message


class MessageOrgSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "type"]


class MessageProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name"]


class MessageSerializer(serializers.ModelSerializer):
    from_org = MessageOrgSerializer(source="from_organization", read_only=True)
    to_org = MessageOrgSerializer(source="to_organization", read_only=True)
    products = MessageProductSerializer(source="product", read_only=True)

    from_organization_id = serializers.PrimaryKeyRelatedField(
        source="from_organization", queryset=Organization.objects.all(), write_only=True
    )
    to_organization_id = serializers.PrimaryKeyRelatedField(
        source="to_organization", queryset=Organization.objects.all(), write_only=True
    )
    product_id = serializers.PrimaryKeyRelatedField(
        source="product", queryset=Product.objects.all(), write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Message
        fields = [
            "id",
            "from_org",
            "to_org",
            "products",
            "from_organization_id",
            "to_organization_id",
            "product_id",
            "subject",
            "message",
            "sender",
            "read",
            "created_at",
        ]
        read_only_fields = ["id", "sender", "read", "created_at"]
