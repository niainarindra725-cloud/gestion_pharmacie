from django.utils import timezone
from django.db.models import F
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Categorie, Produit
from .serializers import CategorieSerializer, ProduitSerializer


class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProduitViewSet(viewsets.ModelViewSet):
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["categorie"]
    search_fields = ["nom"]

    @action(detail=False, methods=["get"])
    def alertes_stock(self, request):
        produits = self.get_queryset().filter(quantite_stock__lte=F("seuil_alerte"))
        serializer = self.get_serializer(produits, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def bientot_expires(self, request):
        limite = timezone.now().date() + timezone.timedelta(days=30)
        produits = self.get_queryset().filter(date_expiration__lte=limite)
        serializer = self.get_serializer(produits, many=True)
        return Response(serializer.data)