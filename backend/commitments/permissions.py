from rest_framework.permissions import SAFE_METHODS, BasePermission

from organizations.models import OrganizationMember


def is_member(user, organization_id):
    return OrganizationMember.objects.filter(organization_id=organization_id, user=user).exists()


class IsCommitmentParticipantOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        restaurant_id = request.data.get("restaurant_organization_id")
        farm_id = request.data.get("farm_organization_id")
        return is_member(request.user, restaurant_id) or is_member(request.user, farm_id)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return is_member(request.user, obj.restaurant_organization_id) or is_member(
            request.user, obj.farm_organization_id
        )


class IsCommitmentDeliveryParticipantOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        commitment = obj.commitment
        return is_member(request.user, commitment.restaurant_organization_id) or is_member(
            request.user, commitment.farm_organization_id
        )
