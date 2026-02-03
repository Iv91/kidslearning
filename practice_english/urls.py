
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from lessons import views
from lessons.views import index, check
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', index, name='index'),
    path('about/', TemplateView.as_view(template_name="about.html"), name="about"),
    path('lessons/', include('lessons.urls')),
    path('resources/', include('resources.urls')),
    path('api/quizzes/', include('quizzes.urls')),
    path('resources/', include('resources.urls')),
    path('nested_admin/', include('nested_admin.urls')),
    path('api/', include('subscriptions.urls')),
    path('contact/', views.contact, name='contact'),
    path("check/", check, name="check"),
    path("blog/", include("blog.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)