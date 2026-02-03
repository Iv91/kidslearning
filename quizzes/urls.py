from django.urls import path
from .views import QuizDetailAPIView, SubmitQuizAttemptAPIView, QuizListAPIView, VisualQuizDetailAPIView, AudioQuizDetailAPIView


urlpatterns = [
    path('', QuizListAPIView.as_view(), name='quiz-list'),
    path('<int:pk>/', QuizDetailAPIView.as_view(), name='quiz-detail'),
    path('submit/', SubmitQuizAttemptAPIView.as_view(), name='submit-quiz'),
    path("visual-quiz/<int:pk>/", VisualQuizDetailAPIView.as_view(), name="visual-quiz-detail"),
    

    
    
]