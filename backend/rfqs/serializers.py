from django.utils import timezone
from rest_framework import serializers

from .models import RFQ


class RFQSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source="buyer.company_name", read_only=True)
    buyer_username = serializers.CharField(source="buyer.username", read_only=True)
    quotation_count = serializers.IntegerField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = RFQ
        fields = [
            "id",
            "buyer",
            "buyer_name",
            "buyer_username",
            "product_name",
            "description",
            "quantity",
            "unit",
            "delivery_location",
            "deadline",
            "status",
            "quotation_count",
            "is_expired",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "buyer", "created_at", "updated_at"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value

    def validate_deadline(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError("Deadline cannot be in the past.")
        return value

    def validate_product_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Product/service name is required.")
        return value.strip()

    def validate_delivery_location(self, value):
        if not value.strip():
            raise serializers.ValidationError("Delivery location is required.")
        return value.strip()