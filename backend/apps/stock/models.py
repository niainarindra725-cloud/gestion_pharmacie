from django.db import models

from django.conf import settings
from django.db import models
from apps.fournisseurs.models import Fournisseur
from apps.medicaments.models import Produit


class Approvisionnement(models.Model):
    """Entité APPROVISIONNEMENT : livré par un Fournisseur, enregistré par un Utilisateur."""

    date_appro = models.DateTimeField(auto_now_add=True)
    fournisseur = models.ForeignKey(
        Fournisseur, on_delete=models.PROTECT, related_name="approvisionnements"
    )
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="approvisionnements"
    )

    class Meta:
        verbose_name = "Approvisionnement"
        verbose_name_plural = "Approvisionnements"
        ordering = ["-date_appro"]

    def __str__(self):
        return f"Appro #{self.id} - {self.fournisseur.nom}"

    @property
    def montant_total(self):
        return sum(l.quantite_recue * l.prix_achat for l in self.lignes.all())


class LigneAppro(models.Model):
    """Entité LIGNE_APPRO : association Produit <-> Approvisionnement."""

    approvisionnement = models.ForeignKey(
        Approvisionnement, on_delete=models.CASCADE, related_name="lignes"
    )
    produit = models.ForeignKey(
        Produit, on_delete=models.PROTECT, related_name="lignes_appro"
    )
    quantite_recue = models.PositiveIntegerField()
    prix_achat = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = "Ligne d'approvisionnement"
        verbose_name_plural = "Lignes d'approvisionnement"
        unique_together = ["approvisionnement", "produit"]

    def __str__(self):
        return f"{self.produit.nom} x{self.quantite_recue}"

    def save(self, *args, **kwargs):
        """Réapprovisionne automatiquement le stock du produit."""
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new:
            self.produit.quantite_stock += self.quantite_recue
            self.produit.save(update_fields=["quantite_stock"])
