from django.contrib import admin

from .models import Commitment, CommitmentDelivery

admin.site.register(Commitment)
admin.site.register(CommitmentDelivery)
