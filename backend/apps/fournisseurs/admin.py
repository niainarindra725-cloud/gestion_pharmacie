from django.contrib import admin
from .models import Fournisseur


@admin.register(Fournisseur)
class FournisseurAdmin(admin.ModelAdmin):
    list_display = ["id", "nom", "telephone"]
    search_fields = ["nom", "telephone"]
