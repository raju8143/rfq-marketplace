from django.urls import path

from .views import MyRFQListView, RFQDetailView, RFQListCreateView

urlpatterns = [
    path("", RFQListCreateView.as_view(), name="rfq-list-create"),
    path("mine/", MyRFQListView.as_view(), name="rfq-mine"),
    path("<int:pk>/", RFQDetailView.as_view(), name="rfq-detail"),
]
