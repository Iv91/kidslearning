from django.db import models
from lessons.models import Lesson

class Worksheet(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True, related_name='resources')
    file = models.FileField(upload_to='resources/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='resources_images/', blank=True, null=True)

    def __str__(self):
        return self.title