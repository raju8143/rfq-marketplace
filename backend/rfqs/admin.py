from django.contrib import admin

from .models import RFQ


@admin.register(RFQ)
class RFQAdmin(admin.ModelAdmin):
    list_display = ("id", "product_name", "buyer", "quantity", "deadline", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("product_name", "description")
