from rest_framework import serializers
from .models import Quiz, Question, Option, QuizAttempt, SortingPair, VisualQuizOption, VisualQuizQuestion, MatchingGame, AudioQuizOption, AudioQuizQuestion


class QuizListSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ["id", "title", "quiz_type", "difficulty", "cover_image"]

    def get_cover_image(self, obj):
        request = self.context.get("request")
        if obj.cover_image and hasattr(obj.cover_image, "url"):
            return request.build_absolute_uri(obj.cover_image.url)
        return None

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'options']


class MatchingGameSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    masked_word = serializers.SerializerMethodField()
    correct_letter = serializers.SerializerMethodField()

    class Meta:
        model = MatchingGame
        fields = ['id', 'image_url', 'masked_word', 'correct_letter', 'distractor1', 'distractor2']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_masked_word(self, obj):
        return obj.masked_word()

    def get_correct_letter(self, obj):
        if 0 <= obj.missing_index < len(obj.full_word):
            return obj.full_word[obj.missing_index]
        return ''

class AudioQuizOptionSerializer(serializers.ModelSerializer):
    audio_file = serializers.SerializerMethodField()

    class Meta:
        model = AudioQuizOption
        fields = ["id", "text", "audio_file", "is_correct"]

    def get_audio_file(self, obj):
        request = self.context.get("request")
        if not obj.audio_file:
            return None
        url = obj.audio_file.url
        return request.build_absolute_uri(url) if request else url


class AudioQuizQuestionSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    options = AudioQuizOptionSerializer(many=True, read_only=True)

    class Meta:
        model = AudioQuizQuestion
        fields = ["id", "image", "correct_answer", "options"]

    def get_image(self, obj):
        request = self.context.get("request")
        if not obj.image:
            return None
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url



class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    sorting_pairs = serializers.SerializerMethodField()
    matching_items = MatchingGameSerializer(many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()
    audio_questions = AudioQuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'quiz_type', 'difficulty', 'questions', 'sorting_pairs', 'matching_items', 'cover_image', 'audio_questions',]

    def get_cover_image(self, obj):
        request = self.context.get('request')
        if obj.cover_image and hasattr(obj.cover_image, 'url'):
            return request.build_absolute_uri(obj.cover_image.url)
        return None
    
    

    def get_sorting_pairs(self, obj):
        request = self.context.get('request')
        pairs = obj.sorting_pairs.all()
        return SortingPairSerializer(pairs, many=True, context={'request': request}).data

class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'user', 'score', 'submitted_at']



        
class SortingPairSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = SortingPair
        fields = ['id', 'item', 'label', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None

    



class VisualQuizOptionSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = VisualQuizOption
        fields = ["id", "image_url", "is_correct"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        return request.build_absolute_uri(obj.image.url) if obj.image else None


class VisualQuizQuestionSerializer(serializers.ModelSerializer):
    options = VisualQuizOptionSerializer(many=True, read_only=True)
    question_image_url = serializers.SerializerMethodField()

    class Meta:
        model = VisualQuizQuestion
        fields = ["id", "question_text", "question_image_url", "options"]

    def get_question_image_url(self, obj):
        request = self.context.get("request")
        return request.build_absolute_uri(obj.question_image.url) if obj.question_image else None


class VisualQuizSerializer(serializers.ModelSerializer):
    questions = VisualQuizQuestionSerializer(many=True, read_only=True, source="visual_questions")

    class Meta:
        model = Quiz
        fields = ["id", "title", "quiz_type", "difficulty", "cover_image", "questions"]

