from django.contrib import admin
from django.utils.html import format_html

from .models import Lesson, LessonCategory, ContactMessage, LessonBlock


@admin.register(LessonCategory)
class LessonCategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


class LessonBlockInline(admin.TabularInline):
    model = LessonBlock
    extra = 0
    fields = ("order", "block_type", "title", "video")
    ordering = ("order",)


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "age_group",
        "order",
        "created_at",
        "short_description",
        "video_type",
        "blocks_count",
    )
    search_fields = ("title", "title_sr", "title_de", "description", "category__name")
    list_filter = ("category", "age_group")
    ordering = ("category__order", "order", "created_at")
    inlines = [LessonBlockInline]

    def short_description(self, obj):
        return (obj.description[:50] + "...") if obj.description else "—"
    short_description.short_description = "Description"

    def video_type(self, obj):
        # If blocks exist -> lesson uses multiple videos
        if hasattr(obj, "blocks") and obj.blocks.exists():
            return "Blocks"
        # Otherwise fallback to single lesson video fields
        if obj.video_url:
            return "YouTube"
        if getattr(obj, "video_file", None):
            return "Uploaded Video"
        return "—"
    video_type.short_description = "Video"

    def blocks_count(self, obj):
        return obj.blocks.count()
    blocks_count.short_description = "Blocks"


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("colored_name", "email", "created_at", "is_read")
    list_filter = ("is_read", "created_at")
    search_fields = ("name", "email", "message")
    actions = ["mark_as_read", "mark_as_unread"]

    def colored_name(self, obj):
        if not obj.is_read:
            return format_html(
                '<span style="font-weight:bold; color:#007bff;">📩 {}</span>',
                obj.name,
            )
        return format_html('<span style="color:#888;">{}</span>', obj.name)

    @admin.action(description="Mark selected messages as read")
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f"{updated} message(s) marked as read ✅")

    @admin.action(description="Mark selected messages as unread")
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f"{updated} message(s) marked as unread 📩")

    def get_object(self, request, object_id, from_field=None):
        obj = super().get_object(request, object_id, from_field)
        if obj and not obj.is_read:
            obj.is_read = True
            obj.save()
        return obj


@admin.register(LessonBlock)
class LessonBlockAdmin(admin.ModelAdmin):
    list_display = ("lesson", "order", "block_type", "title")
    list_filter = ("block_type", "lesson__category", "lesson__age_group")
    search_fields = ("title", "lesson__title", "lesson__title_sr", "lesson__title_de")
    ordering = ("lesson", "order")
