from django.db import transaction
from rest_framework import serializers
from .models import Panier, LignePanier, Facture, LigneFacture, Paiement

class LignePanierSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source="produit.nom", read_only=True)

    class Meta:
        model = LignePanier
        fields = ["id", "panier", "produit", "produit_nom", "quantite", "prix_unitaire"]
        read_only_fields = ["panier"]

    def validate(self, attrs):
        produit = attrs.get("produit")
        quantite = attrs.get("quantite")
        if produit and quantite and quantite > produit.quantite_stock:
            raise serializers.ValidationError(
                {"quantite": f"Stock insuffisant. Disponible : {produit.quantite_stock}"}
            )
        return attrs


class PanierSerializer(serializers.ModelSerializer):
    lignes = LignePanierSerializer(many=True, required=False)
    client_nom = serializers.CharField(source="client.nom", read_only=True)
    montant_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    class Meta:
        model = Panier
        fields = [
            "id", 
            "date_creation", 
            "statut", 
            "client", 
            "client_nom",
            "utilisateur", 
            "lignes", 
            "montant_total",
        ]
        read_only_fields = ["date_creation", "utilisateur"]

    def create(self, validated_data):
        lignes_data = validated_data.pop("lignes", [])
        validated_data["utilisateur"] = self.context["request"].user
        panier = Panier.objects.create(**validated_data)
        for ligne in lignes_data:
            LignePanier.objects.create(panier=panier, **ligne)
        return panier

class LigneFactureSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source="produit.nom", read_only=True)

    class Meta:
        model = LigneFacture
        fields = ["id",
                  "facture",
                  "produit", 
                  "produit_nom", 
                  "quantite",
                  "sous_total"]
        read_only_fields = ["facture"]


class PaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
        fields = ["id",
                  "facture", 
                  "date_paiement", 
                  "montant", 
                  "mode_paiement"]
        read_only_fields = ["date_paiement"]


class FactureSerializer(serializers.ModelSerializer):
    lignes = LigneFactureSerializer(many=True, read_only=True)
    paiements = PaiementSerializer(many=True, read_only=True)
    client_nom = serializers.CharField(source="client.nom", read_only=True)
    client_telephone = serializers.CharField(source="client.telephone", read_only=True)
    utilisateur_nom = serializers.CharField(source="utilisateur.nom", read_only=True)
    utilisateur_role = serializers.CharField(source="utilisateur.role", read_only=True)
    montant_paye = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    solde_restant = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Facture
        fields = [
            "id", 
            "numero_facture", 
            "date_facture",
            "montant_total",
            "panier",
            "client", 
            "client_nom", 
            "client_telephone",
            "utilisateur", 
            "utilisateur_nom", 
            "utilisateur_role",
            "lignes", 
            "paiements", 
            "montant_paye", 
            "solde_restant",
        ]
        read_only_fields = ["numero_facture", "date_facture", "montant_total", "utilisateur"]
class FactureCreateFromPanierSerializer(serializers.Serializer):
    panier_id = serializers.PrimaryKeyRelatedField(queryset=Panier.objects.all())

    def create(self, validated_data):
        import uuid
        panier = validated_data["panier_id"]
        user = self.context["request"].user

        with transaction.atomic():
            numero = f"FAC-{panier.id}-{uuid.uuid4().hex[:6].upper()}"
            facture = Facture.objects.create(
                numero_facture=numero,
                panier=panier,
                client=panier.client,
                utilisateur=user,
                montant_total=panier.montant_total,
            )
            for ligne in panier.lignes.all():
                LigneFacture.objects.create(
                    facture=facture,
                    produit=ligne.produit,
                    quantite=ligne.quantite,
                    sous_total=ligne.quantite * ligne.prix_unitaire,
                )
                ligne.produit.quantite_stock = max(
                    0, ligne.produit.quantite_stock - ligne.quantite
                )
                ligne.produit.save(update_fields=["quantite_stock"])

            panier.statut = Panier.Statut.VALIDE
            panier.save(update_fields=["statut"])

        return facture