from rest_framework import permissions


class IsBuyer(permissions.BasePermission):
    message = "Only buyers can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_buyer())


class IsSupplier(permissions.BasePermission):
    message = "Only suppliers can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_supplier())


class IsOwnerBuyer(permissions.BasePermission):
    """Object-level: only the buyer who created the RFQ may edit/delete it."""

    message = "You can only manage your own RFQs."

    def has_object_permission(self, request, view, obj):
        return obj.buyer_id == request.user.id
