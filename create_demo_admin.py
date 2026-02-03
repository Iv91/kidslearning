import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "practice_english.settings")
django.setup()

from django.contrib.auth.models import User

USERNAME = "demo"
PASSWORD = "demo1234"

if not User.objects.filter(username=USERNAME).exists():
    User.objects.create_superuser(
        username=USERNAME,
        email="demo@example.com",
        password=PASSWORD
    )
    print("✅ Demo superuser created")
else:
    print("✅ Demo superuser already exists")
