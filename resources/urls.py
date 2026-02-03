from django.urls import path
from . import views
from .views import resources_home, resource_detail

urlpatterns = [
    path('', resources_home, name='resources-home'),
    path('<int:pk>/', views.resource_detail, name='resource_detail'),
]
