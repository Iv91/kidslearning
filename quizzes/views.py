from django.shortcuts import render, get_object_or_404
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Quiz, QuizAttempt
from .serializers import QuizSerializer, QuizAttemptSerializer, VisualQuizSerializer, QuizListSerializer


class QuizDetailAPIView(generics.RetrieveAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

class SubmitQuizAttemptAPIView(generics.CreateAPIView):
    queryset = QuizAttempt.objects.all()
    serializer_class = QuizAttemptSerializer

class QuizListAPIView(generics.ListAPIView):
    queryset = Quiz.objects.all().order_by("-id")
    serializer_class = QuizListSerializer

class VisualQuizDetailAPIView(APIView):
    def get(self, request, pk):
        quiz = get_object_or_404(Quiz, pk=pk, quiz_type='visual')
        serializer = VisualQuizSerializer(quiz, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class AudioQuizDetailAPIView(generics.RetrieveAPIView):
    queryset = Quiz.objects.filter(quiz_type="audio")
    serializer_class = QuizSerializer  # extend serializer to include audio questions