from rest_framework import permissions


class IsSupplier(permissions.BasePermission):
    message = "Only suppliers can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_supplier())


class IsQuotationOwnerOrRFQBuyer(permissions.BasePermission):
    """
    A quotation can be viewed by the supplier who submitted it or the buyer
    who owns the related RFQ. Only the submitting supplier may edit/delete it.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        if request.method in permissions.SAFE_METHODS:
            return obj.supplier_id == user.id or obj.rfq.buyer_id == user.id
        return obj.supplier_id == user.id
