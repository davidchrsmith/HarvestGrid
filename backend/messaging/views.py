from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from organizations.models import OrganizationMember
from .models import Message
from .serializers import MessageSerializer


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        org_ids = OrganizationMember.objects.filter(user=self.request.user).values_list(
            "organization_id", flat=True
        )
        return (
            Message.objects.select_related("from_organization", "to_organization", "product")
            .filter(Q(from_organization_id__in=org_ids) | Q(to_organization_id__in=org_ids))
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        organization_id = serializer.validated_data["from_organization"].id
        is_member = OrganizationMember.objects.filter(
            organization_id=organization_id, user=self.request.user
        ).exists()
        if not is_member:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("You are not a member of the sending organization")
        serializer.save(sender=self.request.user)
