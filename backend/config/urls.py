from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    return JsonResponse({"status": "ok", "service": "rfq-marketplace-api"})


urlpatterns = [
    path("", health_check),
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/rfqs/", include("rfqs.urls")),
    path("api/quotations/", include("quotations.urls")),
]
