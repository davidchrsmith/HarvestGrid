from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from organizations.models import OrganizationMember
from .models import Commitment, CommitmentDelivery
from .permissions import IsCommitmentDeliveryParticipantOrReadOnly, IsCommitmentParticipantOrReadOnly
from .serializers import CommitmentDeliverySerializer, CommitmentSerializer


class CommitmentViewSet(viewsets.ModelViewSet):
    serializer_class = CommitmentSerializer
    permission_classes = [IsAuthenticated, IsCommitmentParticipantOrReadOnly]

    def get_queryset(self):
        org_ids = OrganizationMember.objects.filter(user=self.request.user).values_list(
            "organization_id", flat=True
        )
        queryset = (
            Commitment.objects.select_related("restaurant_organization", "farm_organization")
            .filter(Q(restaurant_organization_id__in=org_ids) | Q(farm_organization_id__in=org_ids))
            .order_by("next_delivery_date")
        )
        status_param = self.request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CommitmentDeliveryViewSet(viewsets.ModelViewSet):
    serializer_class = CommitmentDeliverySerializer
    permission_classes = [IsAuthenticated, IsCommitmentDeliveryParticipantOrReadOnly]

    def get_queryset(self):
        queryset = CommitmentDelivery.objects.select_related("commitment").all()
        commitment = self.request.query_params.get("commitment")
        if commitment:
            queryset = queryset.filter(commitment_id=commitment)
        return queryset
