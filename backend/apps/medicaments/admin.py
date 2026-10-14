from django.contrib import admin

from django.contrib import admin
from .models import Categorie, Produit


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ["id", "libelle"]
    search_fields = ["libelle"]


@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display = [
        "id", 
        "nom", 
        "categorie", 
        "prix_vente",
        "quantite_stock", 
        "seuil_alerte", 
        "date_expiration",
    ]
    list_filter = ["categorie"]
    search_fields = ["nom"]
