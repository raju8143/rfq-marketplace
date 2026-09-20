from django.conf import settings
from django.db import models

from rfqs.models import RFQ


class Quotation(models.Model):
    """A supplier's quotation submitted against a buyer's RFQ."""

    rfq = models.ForeignKey(RFQ, on_delete=models.CASCADE, related_name="quotations")
    supplier = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="quotations"
    )
    quoted_price = models.DecimalField(max_digits=12, decimal_places=2)
    estimated_delivery_days = models.PositiveIntegerField(
        help_text="Estimated delivery time in days"
    )
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        # A supplier can only submit one quotation per RFQ. They can edit
        # it (via PATCH) instead of spamming duplicate quotes.
        constraints = [
            models.UniqueConstraint(fields=["rfq", "supplier"], name="one_quote_per_supplier_per_rfq")
        ]

    def __str__(self):
        return f"Quote#{self.id} on RFQ#{self.rfq_id} by {self.supplier}"
