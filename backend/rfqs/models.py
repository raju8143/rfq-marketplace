from django.conf import settings
from django.db import models
from django.utils import timezone


class RFQ(models.Model):
    """A buyer's Request for Quotation."""

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        CLOSED = "CLOSED", "Closed"

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="rfqs"
    )
    product_name = models.CharField(max_length=200)
    description = models.TextField()
    quantity = models.PositiveIntegerField()
    unit = models.CharField(max_length=50, default="units")
    delivery_location = models.CharField(max_length=200)
    deadline = models.DateField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"RFQ#{self.id} - {self.product_name}"

    @property
    def is_expired(self):
        return self.deadline < timezone.localdate()

    @property
    def quotation_count(self):
        return self.quotations.count()
