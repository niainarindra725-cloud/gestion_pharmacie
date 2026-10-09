from django.contrib import admin
from django.contrib import admin
from .models import Approvisionnement, LigneAppro


class LigneApproInline(admin.TabularInline):
    model = LigneAppro
    extra = 1


@admin.register(Approvisionnement)
class ApprovisionnementAdmin(admin.ModelAdmin):
    list_display = ["id", "date_appro", "fournisseur", "utilisateur"]
    list_filter = ["fournisseur"]
    inlines = [LigneApproInline]
