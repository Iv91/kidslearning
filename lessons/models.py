from django.db import models

class LessonCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    order = models.PositiveIntegerField(default=0, help_text="Control the order of categories (e.g., Spelling first)")

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name

class Lesson(models.Model):
    AGE_GROUP_CHOICES = [
        ('4-5', '4–5 years'),
        ('6-7', '6–7 years'),
    ]

    # 🌍 Titles
    title = models.CharField(max_length=255)
    title_sr = models.CharField("Title (Serbian)", max_length=255, blank=True, null=True)
    title_de = models.CharField("Title (German)", max_length=255, blank=True, null=True)

    category = models.ForeignKey(
        LessonCategory,
        on_delete=models.CASCADE,
        related_name='lessons'
    )

    # 🌍 Descriptions
    description = models.TextField()
    description_sr = models.TextField("Description (Serbian)", blank=True, null=True)
    description_de = models.TextField("Description (German)", blank=True, null=True)

    video_url = models.URLField(blank=True, null=True)
    video_file = models.FileField(upload_to='lessons/videos/', blank=True, null=True)
    image = models.ImageField(upload_to='lesson_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    order = models.PositiveIntegerField(
        default=0,
        help_text="Control the flow of lessons for each age group"
    )
    age_group = models.CharField(
        max_length=10,
        choices=AGE_GROUP_CHOICES,
        default='4-5'
    )

    class Meta:
        ordering = ["category__order", "order", "created_at"]

    def __str__(self):
        return self.title

    def embed_video_url(self):
        """
        Converts YouTube watch URL to embed format, otherwise returns raw URL.
        Example: https://www.youtube.com/watch?v=abcd → https://www.youtube.com/embed/abcd
        """
        if self.video_url and "youtube.com/watch?v=" in self.video_url:
            video_id = self.video_url.split("watch?v=")[-1].split("&")[0]
            return f"https://www.youtube.com/embed/{video_id}"
        return self.video_url



class LessonBlock(models.Model):
    lesson = models.ForeignKey(
        Lesson,
        related_name="blocks",
        on_delete=models.CASCADE
    )

    title = models.CharField(max_length=200)
    title_sr = models.CharField(max_length=200, blank=True, null=True)
    title_de = models.CharField(max_length=200, blank=True, null=True)

    video = models.FileField(
        upload_to="lesson_videos/",
        blank=True,
        null=True,
        help_text="Optional short video for this block"
    )

    block_type = models.CharField(
        max_length=20,
        choices=[
            ("explain", "Explain"),
            ("story", "Story"),
        ],
        default="explain"
    )

    order = models.PositiveIntegerField(
        default=0,
        help_text="Playback order inside the lesson"
    )

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.lesson.title} – {self.title}"

    
class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)  # 👈 New field

    def __str__(self):
        status = "✅" if self.is_read else "📩"
        return f"{status} Message from {self.name} ({self.email})"
