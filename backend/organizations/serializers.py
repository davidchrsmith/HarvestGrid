from rest_framework import serializers

from .models import Organization, OrganizationMember, OrganizationReliability


class OrganizationReliabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationReliability
        fields = [
            "active_partnerships",
            "total_commitments",
            "completed_commitments",
            "total_deliveries",
            "on_time_deliveries",
        ]


class OrganizationSerializer(serializers.ModelSerializer):
    reliability = OrganizationReliabilitySerializer(read_only=True)

    class Meta:
        model = Organization
        fields = [
            "id",
            "name",
            "type",
            "description",
            "location",
            "delivery_days",
            "pickup_available",
            "delivery_notes",
            "created_by",
            "created_at",
            "reliability",
        ]
        read_only_fields = ["id", "created_by", "created_at"]


class OrganizationLogisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["delivery_days", "pickup_available", "delivery_notes"]


class OrganizationMemberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    user_type = serializers.CharField(source="user.user_type", read_only=True)

    class Meta:
        model = OrganizationMember
        fields = ["id", "organization", "user", "email", "user_type", "role", "created_at"]
        read_only_fields = ["id", "created_at"]


class OrganizationMembershipSerializer(serializers.ModelSerializer):
    """Used for the 'my organizations' listing, nesting the organization."""

    organization = OrganizationSerializer(read_only=True)

    class Meta:
        model = OrganizationMember
        fields = ["id", "organization", "role", "created_at"]
