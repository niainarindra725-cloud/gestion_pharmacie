from django.contrib.auth import get_user_model
from rest_framework import serializers

Utilisateur = get_user_model()


class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ["id", "username", "nom", "email", "role", "is_active", "date_joined"]
        read_only_fields = ["id", "date_joined"]


class UtilisateurCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = Utilisateur
        fields = ["id", "username", "nom", "email", "role", "password"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = Utilisateur(**validated_data)
        user.set_password(password)
        user.save()
        return user


class RegisterSerializer(serializers.ModelSerializer):
    """Inscription publique : le compte est créé désactivé, en attente de validation admin."""

    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=Utilisateur.Role.choices, default=Utilisateur.Role.CAISSIER)

    class Meta:
        model = Utilisateur
        fields = ["id", "username", "nom", "email", "password", "role"]

    def validate_username(self, value):
        if Utilisateur.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = Utilisateur(**validated_data, is_active=False)
        user.set_password(password)
        user.save()
        return user


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=6)