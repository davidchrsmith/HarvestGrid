from rest_framework.permissions import SAFE_METHODS, BasePermission

from organizations.models import OrganizationMember


class IsProductOrgMemberOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        organization_id = request.data.get("organization_id")
        if not organization_id:
            return False
        return OrganizationMember.objects.filter(
            organization_id=organization_id, user=request.user
        ).exists()

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return OrganizationMember.objects.filter(organization=obj.organization, user=request.user).exists()
