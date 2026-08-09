from django.contrib import admin

from .models import DemandOffer, DemandRequest

admin.site.register(DemandRequest)
admin.site.register(DemandOffer)
