from django.db import models

from django.db import models


class Categorie(models.Model):
    libelle = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"
        ordering = ["libelle"]

    def __str__(self):
        return self.libelle


class Produit(models.Model):
    nom = models.CharField(max_length=200)
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2)
    quantite_stock = models.PositiveIntegerField(default=0)
    seuil_alerte = models.PositiveIntegerField(default=10)
    date_expiration = models.DateField()
    categorie = models.ForeignKey(
        Categorie, on_delete=models.PROTECT, related_name="produits"
    )

    class Meta:
        verbose_name = "Produit"
        verbose_name_plural = "Produits"
        ordering = ["nom"]

    def __str__(self):
        return self.nom

    @property
    def en_alerte_stock(self):
        return self.quantite_stock <= self.seuil_alerte

    @property
    def est_expire(self):
        from django.utils import timezone
        return self.date_expiration < timezone.now().date()
