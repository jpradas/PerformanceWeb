from django.contrib import admin

from .models.App import App
from .models.Scenario import Scenario
from .models.Transaction import Transaction
from .models.VuserInfo import VuserInfo


admin.site.register(Transaction)
admin.site.register(VuserInfo)
admin.site.register(Scenario)
admin.site.register(App)
#admin.site.register(User)

# Register your models here.
