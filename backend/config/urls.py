from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/organizations/", include("organizations.urls")),
    path("api/products/", include("products.urls")),
    path("api/", include("demand.urls")),
    path("api/", include("commitments.urls")),
    path("api/messages/", include("messaging.urls")),
]
