from rest_framework.permissions import SAFE_METHODS, BasePermission

from organizations.models import OrganizationMember


def is_member(user, organization_id):
    return OrganizationMember.objects.filter(organization_id=organization_id, user=user).exists()


class IsDemandRequestOrgMemberOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        organization_id = request.data.get("organization_id")
        return bool(organization_id) and is_member(request.user, organization_id)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return is_member(request.user, obj.organization_id)


class IsDemandOfferParticipantOrReadOnly(BasePermission):
    """Farms can create offers for their org; either party's org members can update status."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        organization_id = request.data.get("farm_organization_id")
        return bool(organization_id) and is_member(request.user, organization_id)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return is_member(request.user, obj.farm_organization_id) or is_member(
            request.user, obj.demand_request.organization_id
        )
