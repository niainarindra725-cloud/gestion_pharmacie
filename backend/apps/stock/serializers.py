from rest_framework import serializers
from .models import Approvisionnement, LigneAppro


class LigneApproSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source="produit.nom", read_only=True)

    class Meta:
        model = LigneAppro
        fields = ["id", 
                  "approvisionnement", 
                  "produit", 
                  "produit_nom", 
                  "quantite_recue", 
                  "prix_achat"]
        read_only_fields = ["approvisionnement"]

    def validate_quantite_recue(self, value):
        if value <= 0:
            raise serializers.ValidationError("La quantité reçue doit être supérieure à 0.")
        return value

    def validate_prix_achat(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le prix d'achat doit être supérieur à 0.")
        return value


class ApprovisionnementSerializer(serializers.ModelSerializer):
    lignes = LigneApproSerializer(many=True)
    fournisseur_nom = serializers.CharField(source="fournisseur.nom", read_only=True)
    montant_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Approvisionnement
        fields = [
            "id", 
            "date_appro", 
            "fournisseur", 
            "fournisseur_nom",
            "utilisateur", 
            "lignes",
            "montant_total",
        ]
        read_only_fields = ["date_appro", "utilisateur"]

    def validate_lignes(self, value):
        if not value:
            raise serializers.ValidationError("Ajoutez au moins un produit à l'approvisionnement.")
        return value

    def create(self, validated_data):
        lignes_data = validated_data.pop("lignes")
        validated_data["utilisateur"] = self.context["request"].user
        appro = Approvisionnement.objects.create(**validated_data)
        for ligne in lignes_data:
            LigneAppro.objects.create(approvisionnement=appro, **ligne)
        return appro