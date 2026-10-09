from django.contrib import admin

from django.contrib import admin
from .models import Panier, LignePanier, Facture, LigneFacture, Paiement


class LignePanierInline(admin.TabularInline):
    model = LignePanier
    extra = 1


class LigneFactureInline(admin.TabularInline):
    model = LigneFacture
    extra = 0


class PaiementInline(admin.TabularInline):
    model = Paiement
    extra = 0


@admin.register(Panier)
class PanierAdmin(admin.ModelAdmin):
    list_display = ["id", "date_creation", "statut", "client", "utilisateur"]
    list_filter = ["statut"]
    inlines = [LignePanierInline]


@admin.register(Facture)
class FactureAdmin(admin.ModelAdmin):
    list_display = ["numero_facture", "date_facture", "client", "montant_total"]
    search_fields = ["numero_facture"]
    inlines = [LigneFactureInline, PaiementInline]
