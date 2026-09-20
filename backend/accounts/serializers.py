from django.contrib.auth import password_validation
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role", "company_name"]

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def validate_role(self, value):
        if value not in (User.Role.BUYER, User.Role.SUPPLIER):
            raise serializers.ValidationError("Role must be BUYER or SUPPLIER.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "company_name"]


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds basic user info to the JWT response so the frontend doesn't
    need a second round trip right after login."""

    def validate(self, attrs):
        data = super().validate(attrs)
        # SimpleJWT doesn't touch last_login by default (that's a
        # session-auth convention), so record it ourselves on every
        # successful login for admin visibility / auditing.
        self.user.last_login = timezone.now()
        self.user.save(update_fields=["last_login"])
        data["user"] = UserSerializer(self.user).data
        return data
