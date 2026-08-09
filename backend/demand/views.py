from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import DemandOffer, DemandRequest
from .permissions import IsDemandOfferParticipantOrReadOnly, IsDemandRequestOrgMemberOrReadOnly
from .serializers import DemandOfferSerializer, DemandRequestSerializer


class DemandRequestViewSet(viewsets.ModelViewSet):
    serializer_class = DemandRequestSerializer
    permission_classes = [IsAuthenticated, IsDemandRequestOrgMemberOrReadOnly]

    def get_queryset(self):
        queryset = DemandRequest.objects.select_related("organization", "organization__reliability").all()
        status_param = self.request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param)
        organization = self.request.query_params.get("organization")
        if organization:
            queryset = queryset.filter(organization_id=organization)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DemandOfferViewSet(viewsets.ModelViewSet):
    serializer_class = DemandOfferSerializer
    permission_classes = [IsAuthenticated, IsDemandOfferParticipantOrReadOnly]

    def get_queryset(self):
        queryset = DemandOffer.objects.select_related(
            "farm_organization", "farm_organization__reliability", "demand_request"
        ).all()
        demand_request = self.request.query_params.get("demand_request")
        if demand_request:
            queryset = queryset.filter(demand_request_id=demand_request)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
