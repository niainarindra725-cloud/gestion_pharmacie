from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PanierViewSet, LignePanierViewSet, FactureViewSet, PaiementViewSet

router = DefaultRouter()
router.register("paniers", PanierViewSet, basename="panier")
router.register("lignes-panier", LignePanierViewSet, basename="ligne-panier")
router.register("factures", FactureViewSet, basename="facture")
router.register("paiements", PaiementViewSet, basename="paiement")

urlpatterns = [path("", include(router.urls))]