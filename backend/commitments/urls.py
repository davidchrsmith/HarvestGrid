from rest_framework.routers import DefaultRouter

from .views import CommitmentDeliveryViewSet, CommitmentViewSet

router = DefaultRouter(trailing_slash=True)
router.register("commitments", CommitmentViewSet, basename="commitment")
router.register("commitment-deliveries", CommitmentDeliveryViewSet, basename="commitment-delivery")

urlpatterns = router.urls
