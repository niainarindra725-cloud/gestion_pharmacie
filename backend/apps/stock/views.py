from rest_framework import viewsets, permissions
from .models import Approvisionnement, LigneAppro
from .serializers import ApprovisionnementSerializer, LigneApproSerializer


class ApprovisionnementViewSet(viewsets.ModelViewSet):
    queryset = Approvisionnement.objects.all().prefetch_related("lignes")
    serializer_class = ApprovisionnementSerializer
    permission_classes = [permissions.IsAuthenticated]


class LigneApproViewSet(viewsets.ReadOnlyModelViewSet):
    """Lecture seule : les lignes se créent via l'Approvisionnement parent."""

    queryset = LigneAppro.objects.all()
    serializer_class = LigneApproSerializer
    permission_classes = [permissions.IsAuthenticated]