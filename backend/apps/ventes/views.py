from django.shortcuts import render

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import timedelta
from django.utils import timezone
from datetime import timedelta, datetime
from django.db.models import Sum
from .models import Panier, LignePanier, Facture, LigneFacture, Paiement

from .models import Panier, LignePanier, Facture, Paiement
from .serializers import (
    PanierSerializer,
    LignePanierSerializer,
    FactureSerializer,
    FactureCreateFromPanierSerializer,
    PaiementSerializer,
)


class PanierViewSet(viewsets.ModelViewSet):
    queryset = Panier.objects.all().prefetch_related("lignes")
    serializer_class = PanierSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["post"])
    def ajouter_ligne(self, request, pk=None):
        """POST /paniers/{id}/ajouter_ligne/  body: {produit, quantite, prix_unitaire}"""
        panier = self.get_object()
        serializer = LignePanierSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(panier=panier)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LignePanierViewSet(viewsets.ModelViewSet):
    queryset = LignePanier.objects.all()
    serializer_class = LignePanierSerializer
    permission_classes = [permissions.IsAuthenticated]


class FactureViewSet(viewsets.ModelViewSet):
    queryset = Facture.objects.all().prefetch_related("lignes", "paiements")
    serializer_class = FactureSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]  # pas d'update/delete sur une facture

    @action(detail=False, methods=["post"])
    def generer(self, request):
        """POST /factures/generer/  body: {panier_id}"""
        serializer = FactureCreateFromPanierSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        facture = serializer.save()
        return Response(FactureSerializer(facture).data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=["get"])
    def statistiques(self, request):
        """Montant total et quantité de produits vendus sur les 7 derniers jours."""
        tz = timezone.get_current_timezone()
        aujourd_hui = timezone.localtime(timezone.now()).date()
        debut = aujourd_hui - timedelta(days=6)
        resultats = []
        for i in range(7):
            jour = debut + timedelta(days=i)
            debut_jour = timezone.make_aware(datetime.combine(jour, datetime.min.time()), tz)
            fin_jour = debut_jour + timedelta(days=1)

            montant = Facture.objects.filter(
                date_facture__gte=debut_jour, date_facture__lt=fin_jour
            ).aggregate(total=Sum("montant_total"))["total"] or 0

            quantite = LigneFacture.objects.filter(
                facture__date_facture__gte=debut_jour, facture__date_facture__lt=fin_jour
            ).aggregate(total=Sum("quantite"))["total"] or 0

            resultats.append({
                "date": jour.isoformat(),
                "montant_total": float(montant),
                "quantite_produits": quantite,
            })
        return Response(resultats)
    
    @action(detail=False, methods=["get"])
    def total_ventes(self, request):
        """Montant total de toutes les ventes (toutes périodes confondues)."""
        total = Facture.objects.aggregate(total=Sum("montant_total"))["total"] or 0
        nombre_factures = Facture.objects.count()
        return Response({
            "montant_total": float(total),
            "nombre_factures": nombre_factures,
        })
    
    @action(detail=False, methods=["get"])
    def ventes_par_produit(self, request):
        """Quantité totale vendue pour chaque produit (toutes ventes confondues)."""
        resultats = (
            LigneFacture.objects.values("produit__nom")
            .annotate(quantite_totale=Sum("quantite"))
            .order_by("-quantite_totale")[:8]
        )
        return Response([
            {"produit": r["produit__nom"], "quantite": r["quantite_totale"]}
            for r in resultats
        ])


class PaiementViewSet(viewsets.ModelViewSet):
    queryset = Paiement.objects.all()
    serializer_class = PaiementSerializer
    permission_classes = [permissions.IsAuthenticated]


