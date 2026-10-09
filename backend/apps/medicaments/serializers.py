from rest_framework import serializers
from .models import Categorie, Produit


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ["id", "libelle"]


class ProduitSerializer(serializers.ModelSerializer):
    categorie_libelle = serializers.CharField(source="categorie.libelle", read_only=True)
    en_alerte_stock = serializers.BooleanField(read_only=True)
    est_expire = serializers.BooleanField(read_only=True)

    class Meta:
        model = Produit
        fields = [
            "id",
            "nom", 
            "prix_vente", 
            "quantite_stock", 
            "seuil_alerte",
            "date_expiration", 
            "categorie", 
            "categorie_libelle",
            "en_alerte_stock",
            "est_expire",
        ]

    def validate_nom(self, value):
        qs = Produit.objects.filter(nom__iexact=value.strip())
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Un produit avec ce nom existe déjà.")
        return value.strip()

    def validate_prix_vente(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le prix de vente doit être supérieur à 0.")
        return value

    def validate_seuil_alerte(self, value):
        if value < 0:
            raise serializers.ValidationError("Le seuil d'alerte ne peut pas être négatif.")
        return value