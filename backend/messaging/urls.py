from rest_framework.routers import DefaultRouter

from .views import MessageViewSet

router = DefaultRouter(trailing_slash=True)
router.register("", MessageViewSet, basename="message")

urlpatterns = router.urls
