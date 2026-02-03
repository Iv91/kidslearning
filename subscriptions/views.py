from rest_framework import generics
from django.shortcuts import redirect
from django.contrib import messages
from .models import Subscriber
from .serializers import SubscriberSerializer

class SubscribeAPIView(generics.CreateAPIView):
    queryset = Subscriber.objects.all()
    serializer_class = SubscriberSerializer


def subscribe(request):
    if request.method == "POST":
        email = request.POST.get("email")
        if email:
            subscriber, created = Subscriber.objects.get_or_create(email=email)
            if created:
                messages.success(request, "🎉 Thank you for subscribing!")
            else:
                messages.info(request, "📩 You're already subscribed.")
        return redirect(request.META.get("HTTP_REFERER", "/"))
    
