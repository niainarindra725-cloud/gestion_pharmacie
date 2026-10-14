    
from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and (user.role == "ADMIN" or user.is_superuser)
        )


class IsPharmacienOuAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and
            (user.role in ["ADMIN", "PHARMACIEN"] or user.is_superuser)
        )


class IsCaissierOuPlus(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and
            (user.role in ["ADMIN", "PHARMACIEN", "CAISSIER"] or user.is_superuser)
        )