from django.contrib.auth.models import User
from django.db import models
from lessons.models import Lesson


# Create your models here.
class Quiz(models.Model):
    title = models.CharField(max_length=255)
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True, related_name='quizzes')
    quiz_type = models.CharField(max_length=50, choices=[
        ('multiple_choice', 'Multiple Choice'),
        ('fill_blank', 'Fill in the Blank'),
        ('drag_drop', 'Drag and Drop'),
        ('visual', 'Visual Quiz'), 
        ('matching', 'Spelling Quiz'),
        ('audio', 'Audio Quiz'),


    ])
    difficulty = models.CharField(max_length=10, choices=[
        ('easy', 'Easy'),
        ('hard', 'Hard'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    cover_image = models.ImageField(upload_to='quiz_covers/', blank=True, null=True)
    

    def __str__(self):
        return self.title


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.text


class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.text} ({'Correct' if self.is_correct else 'Wrong'})"
    
class QuizAttempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)  # or None if anonymous
    score = models.IntegerField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attempt for {self.quiz.title} - Score: {self.score}"
    
    
class SortingPair(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='sorting_pairs')
    label = models.CharField(max_length=100)  # e.g., "Mammal", "Bird"
    item = models.CharField(max_length=100)   # e.g., "Lion", "Sparrow"
    image = models.ImageField(upload_to='sorting_images/', blank=True, null=True) 

    def __str__(self):
        return f"{self.item} → {self.label}"



class VisualQuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="visual_questions")
    question_text = models.CharField(max_length=255, blank=True, null=True)  # e.g. "Choose the book"
    question_image = models.ImageField(upload_to="visual_quiz_questions/", blank=True, null=True)

    def __str__(self):
        return f"Visual Question for {self.quiz.title}"


class VisualQuizOption(models.Model):
    question = models.ForeignKey(VisualQuizQuestion, on_delete=models.CASCADE, related_name="options")
    image = models.ImageField(upload_to="visual_quiz_options/", blank=True, null=True)  # 👈 Each answer is an image
    is_correct = models.BooleanField(default=False)              # ✅ To mark the correct answer

    def __str__(self):
        return f"Option for {self.question.id} ({'Correct' if self.is_correct else 'Wrong'})"



class MatchingGame(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='matching_items')
    image = models.ImageField(upload_to="matching_game/")
    full_word = models.CharField(max_length=255, help_text="Full correct word, e.g., 'cat'", null=True, blank=True)
    missing_index = models.PositiveIntegerField(help_text="Index of missing letter, e.g., 1 for 'c_t'", null=True, blank=True)
    distractor1 = models.CharField(max_length=1, blank=True, null=True, help_text="Wrong letter option 1")
    distractor2 = models.CharField(max_length=1, blank=True, null=True, help_text="Wrong letter option 2")

    def __str__(self):
        return f"Spelling Quiz for '{self.full_word}'"

    def masked_word(self):
        if 0 <= self.missing_index < len(self.full_word):
            return self.full_word[:self.missing_index] + '_' + self.full_word[self.missing_index+1:]
        return self.full_word

    
class AudioQuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="audio_questions")
    image = models.ImageField(upload_to="audio_quiz_images/")  # e.g. child waking up
    correct_answer = models.CharField(max_length=255)

    def __str__(self):
        return f"Audio Quiz Question for {self.quiz.title}"
    

class AudioQuizOption(models.Model):
    question = models.ForeignKey(AudioQuizQuestion, on_delete=models.CASCADE, related_name="options")
    text = models.CharField(max_length=255)          # e.g. "Good Morning"
    audio_file = models.FileField(upload_to="audio_quiz_options/")  # mp3 with pronunciation
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.text} ({'Correct' if self.is_correct else 'Wrong'})"