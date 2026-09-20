from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model that adds a `role` field on top of Django's
    built-in auth. Role drives authorization throughout the app:
    - BUYER: can create/manage RFQs and view quotations received on them.
    - SUPPLIER: can browse RFQs and submit/view their own quotations.
    """

    class Role(models.TextChoices):
        BUYER = "BUYER", "Buyer"
        SUPPLIER = "SUPPLIER", "Supplier"

    role = models.CharField(max_length=10, choices=Role.choices)
    company_name = models.CharField(max_length=150, blank=True)

    # email is required and used for display; username still exists because
    # it's simplest to keep Django's default auth backend working as-is.
    email = models.EmailField(unique=True)

    REQUIRED_FIELDS = ["email"]

    def is_buyer(self):
        return self.role == self.Role.BUYER

    def is_supplier(self):
        return self.role == self.Role.SUPPLIER

    def __str__(self):
        return f"{self.username} ({self.role})"
