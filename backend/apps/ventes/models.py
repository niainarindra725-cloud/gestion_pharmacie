from django.db import models

from django.conf import settings
from django.db import models
from apps.clients.models import Client
from apps.medicaments.models import Produit


class Panier(models.Model):
    class Statut(models.TextChoices):
        OUVERT = "OUVERT", "Ouvert"
        VALIDE = "VALIDE", "Validé"
        ANNULE = "ANNULE", "Annulé"

    date_creation = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=10, choices=Statut.choices, default=Statut.OUVERT)
    client = models.ForeignKey(
        Client, on_delete=models.SET_NULL, null=True, blank=True, related_name="paniers"
    )
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="paniers"
    )

    class Meta:
        verbose_name = "Panier"
        verbose_name_plural = "Paniers"
        ordering = ["-date_creation"]

    def __str__(self):
        return f"Panier #{self.id} ({self.statut})"

    @property
    def montant_total(self):
        return sum(l.quantite * l.prix_unitaire for l in self.lignes.all())


class LignePanier(models.Model):
    panier = models.ForeignKey(Panier, on_delete=models.CASCADE, related_name="lignes")
    produit = models.ForeignKey(Produit, on_delete=models.PROTECT, related_name="lignes_panier")
    quantite = models.PositiveIntegerField()
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = "Ligne de panier"
        verbose_name_plural = "Lignes de panier"
        unique_together = ["panier", "produit"]

    def __str__(self):
        return f"{self.produit.nom} x{self.quantite}"


class Facture(models.Model):
    numero_facture = models.CharField(max_length=30, unique=True)
    date_facture = models.DateTimeField(auto_now_add=True)
    montant_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    panier = models.OneToOneField(
        Panier, on_delete=models.PROTECT, related_name="facture"
    )
    client = models.ForeignKey(
        Client, on_delete=models.SET_NULL, null=True, blank=True, related_name="factures"
    )
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="factures"
    )

    class Meta:
        verbose_name = "Facture"
        verbose_name_plural = "Factures"
        ordering = ["-date_facture"]

    def __str__(self):
        return self.numero_facture

    @property
    def montant_paye(self):
        return sum(p.montant for p in self.paiements.all())

    @property
    def solde_restant(self):
        return self.montant_total - self.montant_paye


class LigneFacture(models.Model):
    facture = models.ForeignKey(Facture, on_delete=models.CASCADE, related_name="lignes")
    produit = models.ForeignKey(Produit, on_delete=models.PROTECT, related_name="lignes_facture")
    quantite = models.PositiveIntegerField()
    sous_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = "Ligne de facture"
        verbose_name_plural = "Lignes de facture"

    def __str__(self):
        return f"{self.produit.nom} x{self.quantite}"


class Paiement(models.Model):
    class Mode(models.TextChoices):
        ESPECES = "ESPECES", "Espèces"
        CARTE = "CARTE", "Carte bancaire"
        MOBILE = "MOBILE", "Mobile Money"
        VIREMENT = "VIREMENT", "Virement"

    date_paiement = models.DateTimeField(auto_now_add=True)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    mode_paiement = models.CharField(max_length=10, choices=Mode.choices, default=Mode.ESPECES)
    facture = models.ForeignKey(Facture, on_delete=models.CASCADE, related_name="paiements")

    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"
        ordering = ["-date_paiement"]

    def __str__(self):
        return f"Paiement {self.montant} - {self.facture.numero_facture}"
