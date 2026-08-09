from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Product
from .permissions import IsProductOrgMemberOrReadOnly
from .serializers import ProductSerializer


def _str_to_bool(value):
    return str(value).lower() in ("true", "1", "yes")


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsProductOrgMemberOrReadOnly]

    def get_queryset(self):
        queryset = Product.objects.select_related("organization").all()

        is_surplus = self.request.query_params.get("is_surplus")
        if is_surplus is not None:
            queryset = queryset.filter(is_surplus=_str_to_bool(is_surplus))

        available = self.request.query_params.get("available")
        if available is not None:
            queryset = queryset.filter(available=_str_to_bool(available))

        organization = self.request.query_params.get("organization")
        if organization:
            queryset = queryset.filter(organization_id=organization)

        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
