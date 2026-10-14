import re
from datetime import date
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
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Le nom du produit est obligatoire.")
        if not re.search(r"[A-Za-zÀ-ÿ]", value):
            raise serializers.ValidationError(
                "Le nom du produit doit contenir au moins une lettre."
            )
        qs = Produit.objects.filter(nom__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Un produit avec ce nom existe déjà.")
        return value

    def validate_prix_vente(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le prix de vente doit être supérieur à 0.")
        return value

    def validate_seuil_alerte(self, value):
        if value < 0:
            raise serializers.ValidationError("Le seuil d'alerte ne peut pas être négatif.")
        return value

    def validate_date_expiration(self, value):
        if value < date.today():
            raise serializers.ValidationError(
                "Ce médicament a dépassé sa date d'expiration. Impossible de l'ajouter."
            )
        return value