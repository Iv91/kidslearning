from django.db import models

# Create your models here.
from django.db import models
from django.utils.text import slugify

class BlogPost(models.Model):
    title_en = models.CharField(max_length=200)
    title_sr = models.CharField(max_length=200, blank=True)
    title_de = models.CharField(max_length=200, blank=True)

    summary_en = models.TextField(blank=True)
    summary_sr = models.TextField(blank=True)
    summary_de = models.TextField(blank=True)

    content_en = models.TextField()
    content_sr = models.TextField(blank=True)
    content_de = models.TextField(blank=True)

    image = models.ImageField(upload_to="blog/", blank=True, null=True)
    slug = models.SlugField(max_length=220, unique=True, blank=True)

    is_published = models.BooleanField(default=True)
    published_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-published_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title_en)[:200] or "post"
            slug = base
            i = 1
            while BlogPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                i += 1
                slug = f"{base}-{i}"
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title_en
