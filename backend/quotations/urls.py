from django.urls import path

from .views import QuotationDetailView, QuotationListCreateView, RFQQuotationsListView

urlpatterns = [
    path("", QuotationListCreateView.as_view(), name="quotation-list-create"),
    path("<int:pk>/", QuotationDetailView.as_view(), name="quotation-detail"),
    path("rfq/<int:rfq_id>/", RFQQuotationsListView.as_view(), name="rfq-quotations"),
]
