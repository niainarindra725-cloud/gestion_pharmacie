from django.contrib import admin

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Utilisateur


@admin.register(Utilisateur)
class UtilisateurAdmin(UserAdmin):
    list_display = ["username", "nom", "email", "role", "is_active"]
    fieldsets = UserAdmin.fieldsets + (
        ("Infos pharmacie", {"fields": ("nom", "role")}),
    )
