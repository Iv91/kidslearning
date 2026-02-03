from django.contrib import admin
from django.http import HttpResponse
import csv
from .models import Subscriber

@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "created_at")
    search_fields = ("email",)
    list_filter = ("created_at",)
    actions = ["export_as_csv"]

    def export_as_csv(self, request, queryset):
        """
        Export selected subscribers as CSV
        """
        response = HttpResponse(content_type="text/csv")
        response['Content-Disposition'] = 'attachment; filename="subscribers.csv"'
        writer = csv.writer(response)
        writer.writerow(["Email", "Subscribed At"])
        for sub in queryset:
            writer.writerow([sub.email, sub.created_at])
        return response

    export_as_csv.short_description = "Export Selected Subscribers to CSV"

