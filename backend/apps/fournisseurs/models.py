from django.db import models

from django.db import models


class Fournisseur(models.Model):
    nom = models.CharField(max_length=150)
    telephone = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        verbose_name = "Fournisseur"
        verbose_name_plural = "Fournisseurs"
        ordering = ["nom"]

    def __str__(self):
        return self.nom
