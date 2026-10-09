from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    UtilisateurViewSet,
    MeView,
    CustomTokenObtainPairView,
    RegisterView,
    ForgotPasswordView,
    ResetPasswordView,
)

router = DefaultRouter()
router.register("utilisateurs", UtilisateurViewSet, basename="utilisateur")

urlpatterns = [
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/forgot-password/", ForgotPasswordView.as_view(), name="forgot_password"),
    path("auth/reset-password/", ResetPasswordView.as_view(), name="reset_password"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("", include(router.urls)),
]