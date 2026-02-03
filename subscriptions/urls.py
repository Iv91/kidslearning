from django.urls import path
from .views import SubscribeAPIView, subscribe

urlpatterns = [
    path("subscribe/", subscribe, name="subscribe"),          # classic form
    path("api/subscribe/", SubscribeAPIView.as_view(), name="api-subscribe"),
]
