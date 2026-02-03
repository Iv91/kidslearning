from django.contrib import admin
from .models import BlogPost

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ("title_en", "is_published", "published_at")
    list_filter = ("is_published",)
    search_fields = ("title_en", "title_sr", "title_de")
    prepopulated_fields = {"slug": ("title_en",)}
