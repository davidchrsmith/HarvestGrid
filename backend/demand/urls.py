from rest_framework.routers import DefaultRouter

from .views import DemandOfferViewSet, DemandRequestViewSet

router = DefaultRouter(trailing_slash=True)
router.register("demand-requests", DemandRequestViewSet, basename="demand-request")
router.register("demand-offers", DemandOfferViewSet, basename="demand-offer")

urlpatterns = router.urls
