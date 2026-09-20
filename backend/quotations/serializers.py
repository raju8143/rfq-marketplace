from rest_framework import serializers

from rfqs.models import RFQ

from .models import Quotation


class QuotationSerializer(serializers.ModelSerializer):
    supplier_username = serializers.CharField(source="supplier.username", read_only=True)
    supplier_company = serializers.CharField(source="supplier.company_name", read_only=True)
    rfq_product_name = serializers.CharField(source="rfq.product_name", read_only=True)
    buyer_username = serializers.CharField(source="rfq.buyer.username", read_only=True)

    class Meta:
        model = Quotation
        fields = [
            "id",
            "rfq",
            "rfq_product_name",
            "buyer_username",
            "supplier",
            "supplier_username",
            "supplier_company",
            "quoted_price",
            "estimated_delivery_days",
            "message",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "supplier", "created_at", "updated_at"]

    def validate_quoted_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quoted price must be greater than zero.")
        return value

    def validate_estimated_delivery_days(self, value):
        if value <= 0:
            raise serializers.ValidationError("Estimated delivery time must be at least 1 day.")
        return value

    def validate_rfq(self, value):
        if value.status != RFQ.Status.OPEN:
            raise serializers.ValidationError("This RFQ is closed and no longer accepting quotations.")
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        rfq = attrs.get("rfq")
        if request and rfq and not self.instance:
            if Quotation.objects.filter(rfq=rfq, supplier=request.user).exists():
                raise serializers.ValidationError(
                    {"non_field_errors": ["You have already submitted a quotation for this RFQ. Edit your existing one instead."]}
                )
        return attrs
