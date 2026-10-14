import re
from rest_framework import serializers
from .models import Client

NOM_REGEX = re.compile(r"^[A-Za-zÀ-ÿ\s'-]+$")


def valider_telephone(value):
    """Valide un numéro malgache : 0XXXXXXXXX (10 chiffres) ou +261XXXXXXXXX (12 chiffres après le +)."""
    sans_espaces = value.replace(" ", "")

    if sans_espaces.startswith("+261"):
        chiffres = sans_espaces[4:]
        if not chiffres.isdigit() or len(chiffres) != 9:
            raise serializers.ValidationError("Numéro invalide ou incomplet.")
    elif sans_espaces.startswith("0"):
        if not sans_espaces.isdigit() or len(sans_espaces) != 10:
            raise serializers.ValidationError("Numéro invalide ou incomplet.")
    else:
        raise serializers.ValidationError(
            "Le numéro doit commencer par 0 (format local) ou +261 (format international)."
        )
    return value


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ["id", "nom", "telephone"]

    def validate_nom(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Le nom est obligatoire.")
        if not NOM_REGEX.match(value):
            raise serializers.ValidationError("Le nom ne doit contenir que des lettres.")
        return value

    def validate_telephone(self, value):
        if value:
            return valider_telephone(value.strip())
        return value