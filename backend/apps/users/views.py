from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings

from rest_framework import viewsets, permissions, generics, status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .serializers import (
    UtilisateurSerializer,
    UtilisateurCreateSerializer,
    RegisterSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)
from .permissions import IsAdmin

Utilisateur = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["nom"] = user.nom
        token["role"] = user.role
        return token

    def validate(self, attrs):
        username = attrs.get("username")
        try:
            user = Utilisateur.objects.get(username=username)
            if not user.is_active:
                raise serializers.ValidationError(
                    {"detail": "pending_approval"}
                )
        except Utilisateur.DoesNotExist:
            pass
        return super().validate(attrs)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = Utilisateur.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UtilisateurSerializer(request.user).data)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = Utilisateur.objects.get(email=email)
        except Utilisateur.DoesNotExist:
            # Ne pas révéler si l'email existe ou non
            return Response({"detail": "Si ce compte existe, un email a été envoyé."})

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

        send_mail(
            subject="Réinitialisation de votre mot de passe - Pharmacie",
            message=(
                f"Bonjour {user.nom},\n\n"
                f"Cliquez sur ce lien pour réinitialiser votre mot de passe :\n{reset_link}\n\n"
                "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
        return Response({"detail": "Si ce compte existe, un email a été envoyé."})


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            uid = force_str(urlsafe_base64_decode(data["uid"]))
            user = Utilisateur.objects.get(pk=uid)
        except (Utilisateur.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({"detail": "Lien invalide."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, data["token"]):
            return Response({"detail": "Lien invalide ou expiré."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(data["new_password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Mot de passe réinitialisé avec succès."})


class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all().order_by("nom")
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.action == "create":
            return UtilisateurCreateSerializer
        return UtilisateurSerializer

    @action(detail=False, methods=["get"])
    def en_attente(self, request):
        utilisateurs = self.get_queryset().filter(is_active=False)
        serializer = UtilisateurSerializer(utilisateurs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def valider(self, request, pk=None):
        utilisateur = self.get_object()
        utilisateur.is_active = True
        utilisateur.save(update_fields=["is_active"])
        return Response(UtilisateurSerializer(utilisateur).data)

    @action(detail=True, methods=["post"])
    def refuser(self, request, pk=None):
        utilisateur = self.get_object()
        if utilisateur.is_active:
            return Response(
                {"detail": "Ce compte est déjà actif, il ne peut pas être refusé."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        utilisateur.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)