from django.urls import path
from . import views



urlpatterns = [
    
      # ✅ API endpoints (React)
    path("api/lessons/", views.LessonListAPIView.as_view(), name="api_lesson_list"),
    path("api/lessons/<int:pk>/", views.LessonDetailAPIView.as_view(), name="api_lesson_detail"),

    # ✅ HTML pages (Django templates)
    path("search/", views.search_view, name="search"),
    path("show-all/", views.lessons_show_all, name="lessons_show_all"),
    path("worksheets/show-all/", views.worksheets_show_all, name="worksheets_show_all"),
    path("lessons/<str:age_group>/", views.lesson_list, name="lesson_list_by_age"),
    path("<int:pk>/", views.lesson_detail, name="lesson_detail"),
    path("", views.lesson_list, name="lesson_list"),
    
]