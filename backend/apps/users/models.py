from django.db import models
from django.contrib.auth.models import AbstractUser


class Utilisateur(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Administrateur"
        PHARMACIEN = "PHARMACIEN", "Pharmacien"
        CAISSIER = "CAISSIER", "Caissier"

    nom = models.CharField(max_length=150)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CAISSIER)

    REQUIRED_FIELDS = ["nom", "email"]

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self):
        return f"{self.nom} ({self.role})"