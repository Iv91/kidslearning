from rest_framework import serializers
from .models import Lesson, LessonBlock
from quizzes.serializers import QuizSerializer
from resources.serializers import WorksheetSerializer

class LessonDetailSerializer(serializers.ModelSerializer):
    quizzes = QuizSerializer(many=True, read_only=True)
    worksheets = WorksheetSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = ['title', 'category', 'description', 'video_url', 'video_file', 'image', 'created_at', 'quizzes', 'worksheets']

class LessonBlockSerializer(serializers.ModelSerializer):
    video = serializers.SerializerMethodField()

    class Meta:
        model = LessonBlock
        fields = ["id", "title", "block_type", "order", "video"]

    def get_video(self, obj):
        request = self.context.get("request")
        if not obj.video:
            return None
        url = obj.video.url
        return request.build_absolute_uri(url) if request else url


class LessonSerializer(serializers.ModelSerializer):
    video_file = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()

    has_blocks = serializers.SerializerMethodField()
    blocks = LessonBlockSerializer(many=True, read_only=True)

    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Lesson
        fields = [
            "id",
            "category", "category_name",
            "title", "title_sr", "title_de",
            "description", "description_sr", "description_de",
            "age_group",
            "order",
            "created_at",
            "video_url",
            "video_file",
            "image",
            "has_blocks",
            "blocks",
        ]

    def get_has_blocks(self, obj):
        return obj.blocks.exists()

    def get_video_url(self, obj):
        # Use embed if you want:
        # return obj.embed_video_url() if obj.video_url else None
        return obj.video_url if obj.video_url else None

    def get_video_file(self, obj):
        request = self.context.get("request")
        if not obj.video_file:
            return None
        url = obj.video_file.url
        return request.build_absolute_uri(url) if request else url

    def get_image(self, obj):
        request = self.context.get("request")
        if not obj.image:
            return None
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url