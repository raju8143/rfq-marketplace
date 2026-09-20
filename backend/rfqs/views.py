from rest_framework import filters, generics, permissions

from .models import RFQ
from .permissions import IsBuyer, IsOwnerBuyer
from .serializers import RFQSerializer


class RFQListCreateView(generics.ListCreateAPIView):
    """
    GET  -> Browse open RFQs (used by suppliers). Supports:
            ?search=keyword   (matches product name / description / location)
            ?status=OPEN|CLOSED
            ?ordering=deadline,-created_at etc.
    POST -> Create a new RFQ. Buyers only.
    """

    serializer_class = RFQSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["product_name", "description", "delivery_location"]
    ordering_fields = ["deadline", "created_at", "quantity"]

    def get_queryset(self):
        # Suppliers (and anyone browsing) only ever see OPEN RFQs by default,
        # unless a specific status filter is requested.
        qs = RFQ.objects.select_related("buyer").all()
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
        else:
            qs = qs.filter(status=RFQ.Status.OPEN)
        return qs

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsBuyer()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # Force every newly created RFQ to start OPEN, regardless of what
        # (if anything) was sent in the request body for "status". Buyers
        # can only change status afterward via PATCH on the detail endpoint.
        serializer.save(buyer=self.request.user, status=RFQ.Status.OPEN)


class MyRFQListView(generics.ListAPIView):
    """A buyer's own RFQs, across all statuses."""

    serializer_class = RFQSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuyer]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["deadline", "created_at"]

    def get_queryset(self):
        qs = RFQ.objects.filter(buyer=self.request.user)
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
        return qs


class RFQDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Any authenticated user can view RFQ details.
    Only the owning buyer can update/delete it.
    """

    queryset = RFQ.objects.select_related("buyer").all()
    serializer_class = RFQSerializer

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [permissions.IsAuthenticated(), IsOwnerBuyer()]
        return [permissions.IsAuthenticated()]