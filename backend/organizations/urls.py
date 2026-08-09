from rest_framework.routers import DefaultRouter

from .views import OrganizationViewSet

router = DefaultRouter(trailing_slash=True)
router.register("", OrganizationViewSet, basename="organization")

urlpatterns = router.urls
