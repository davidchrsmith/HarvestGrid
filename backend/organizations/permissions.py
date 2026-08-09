from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import OrganizationMember


class IsOrganizationMemberOrReadOnly(BasePermission):
    """Anyone authenticated can read; only members of the org can update it."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return OrganizationMember.objects.filter(organization=obj, user=request.user).exists()
