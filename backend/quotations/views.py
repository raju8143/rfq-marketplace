from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from rfqs.models import RFQ

from .models import Quotation
from .permissions import IsQuotationOwnerOrRFQBuyer, IsSupplier
from .serializers import QuotationSerializer


class QuotationListCreateView(generics.ListCreateAPIView):
    """
    GET  -> the current supplier's own submitted quotations.
    POST -> submit a new quotation on an RFQ. Suppliers only.
    """

    serializer_class = QuotationSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsSupplier()]
        return [permissions.IsAuthenticated(), IsSupplier()]

    def get_queryset(self):
        return Quotation.objects.filter(supplier=self.request.user).select_related("rfq", "rfq__buyer")

    def perform_create(self, serializer):
        serializer.save(supplier=self.request.user)


class QuotationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve/update/delete a single quotation."""

    queryset = Quotation.objects.select_related("rfq", "rfq__buyer", "supplier").all()
    serializer_class = QuotationSerializer
    permission_classes = [permissions.IsAuthenticated, IsQuotationOwnerOrRFQBuyer]


class RFQQuotationsListView(generics.ListAPIView):
    """
    Quotations received on a specific RFQ.
    Only the buyer who owns that RFQ may view this list.
    """

    serializer_class = QuotationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        rfq = get_object_or_404(RFQ, pk=self.kwargs["rfq_id"])
        if rfq.buyer_id != self.request.user.id:
            raise PermissionDenied("You can only view quotations for your own RFQs.")
        return Quotation.objects.filter(rfq=rfq).select_related("supplier")
