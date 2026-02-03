import nested_admin
from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Quiz,
    Question,
    Option,
    SortingPair,
    MatchingGame,
    VisualQuizQuestion,
    VisualQuizOption,
    AudioQuizQuestion,
    AudioQuizOption
)


# Inline for MC Options
class OptionInline(nested_admin.NestedTabularInline):
    model = Option
    extra = 2


# Inline for MC Questions
class QuestionInline(nested_admin.NestedStackedInline):
    model = Question
    extra = 1
    inlines = [OptionInline]


# Inline for Sorting Game
class SortingPairInline(nested_admin.NestedTabularInline):
    model = SortingPair
    extra = 1


# Inline for Matching Game
class MatchingGameInline(nested_admin.NestedTabularInline):
    model = MatchingGame
    extra = 1


# Inline for Visual Quiz Options
class VisualQuizOptionInline(nested_admin.NestedTabularInline):
    model = VisualQuizOption
    extra = 2


# Inline for Visual Quiz Questions
class VisualQuizQuestionInline(nested_admin.NestedStackedInline):
    model = VisualQuizQuestion
    extra = 1
    inlines = [VisualQuizOptionInline]


# Inline for Audio Quiz Options
class AudioQuizOptionInline(nested_admin.NestedTabularInline):
    model = AudioQuizOption
    extra = 2
    fields = ("text", "audio_file", "is_correct")


# Inline for Audio Quiz Questions
class AudioQuizQuestionInline(nested_admin.NestedStackedInline):
    model = AudioQuizQuestion
    extra = 1
    inlines = [AudioQuizOptionInline]


# Full Admin for Quiz
@admin.register(Quiz)
class QuizAdmin(nested_admin.NestedModelAdmin):
    list_display = ("title", "quiz_type", "difficulty", "created_at", "quiz_thumbnail")
    list_filter = ("quiz_type", "difficulty")

    def quiz_thumbnail(self, obj):
        if obj.cover_image:
            return format_html(
                '<img src="{}" width="80" height="auto" style="border-radius: 5px;" />',
                obj.cover_image.url,
            )
        return "-"
    quiz_thumbnail.short_description = "Image"

    def get_inline_instances(self, request, obj=None):
        """
        Dynamically show the right inline depending on quiz_type
        """
        inlines = []
        if obj:
            if obj.quiz_type == "multiple_choice":
                inlines = [QuestionInline]
            elif obj.quiz_type == "drag_drop":
                inlines = [SortingPairInline]
            elif obj.quiz_type == "matching":
                inlines = [MatchingGameInline]
            elif obj.quiz_type == "visual":
                inlines = [VisualQuizQuestionInline]
            elif obj.quiz_type == "audio":   # 👈 add audio quizzes here
                inlines = [AudioQuizQuestionInline]
        else:
            return []

        return [inline(self.model, self.admin_site) for inline in inlines]




