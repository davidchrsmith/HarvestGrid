from django.db import transaction
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Organization, OrganizationMember
from .permissions import IsOrganizationMemberOrReadOnly
from .serializers import (
    OrganizationLogisticsSerializer,
    OrganizationMemberSerializer,
    OrganizationMembershipSerializer,
    OrganizationSerializer,
)


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.select_related("reliability").all().order_by("-created_at")
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMemberOrReadOnly]

    def perform_create(self, serializer):
        with transaction.atomic():
            organization = serializer.save(created_by=self.request.user)
            OrganizationMember.objects.create(
                organization=organization, user=self.request.user, role="owner"
            )

    @action(detail=False, methods=["get"])
    def mine(self, request):
        memberships = OrganizationMember.objects.filter(user=request.user).select_related("organization")
        serializer = OrganizationMembershipSerializer(memberships, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def members(self, request, pk=None):
        organization = self.get_object()
        members = OrganizationMember.objects.filter(organization=organization).select_related("user")
        serializer = OrganizationMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], url_path="logistics")
    def logistics(self, request, pk=None):
        organization = self.get_object()
        serializer = OrganizationLogisticsSerializer(organization, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(OrganizationSerializer(organization).data)
