from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from .models import Fournisseur
from .serializers import FournisseurSerializer


class FournisseurViewSet(viewsets.ModelViewSet):
    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["nom", "telephone"]
