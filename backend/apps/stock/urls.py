from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApprovisionnementViewSet, LigneApproViewSet

router = DefaultRouter()
router.register("approvisionnements", ApprovisionnementViewSet, basename="approvisionnement")
router.register("lignes-appro", LigneApproViewSet, basename="ligne-appro")

urlpatterns = [path("", include(router.urls))]