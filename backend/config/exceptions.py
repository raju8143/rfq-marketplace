"""
Wraps DRF's default exception handler so every API error returned to the
frontend has a consistent shape: {"detail": "...", "errors": {...}}
This makes it easy for the React app to show one generic error banner
while still having access to field-level validation errors when present.
"""
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        data = response.data
        if isinstance(data, dict):
            # Field validation errors come back as {"field": ["msg"]}
            detail = data.get("detail")
            if detail is None:
                detail = "Please check the highlighted fields."
                errors = data
            else:
                errors = {}
            response.data = {"detail": detail, "errors": errors}
        elif isinstance(data, list):
            response.data = {"detail": "Please check the highlighted fields.", "errors": {"non_field_errors": data}}
    return response
