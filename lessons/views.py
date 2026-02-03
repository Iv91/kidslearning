from django.shortcuts import render, get_object_or_404, redirect
from .models import ContactMessage, Lesson, LessonCategory, LessonBlock
from django.contrib import messages
from quizzes.models import Quiz 
from resources.models import Worksheet
from django.conf import settings
from django.core.paginator import Paginator
from django.db.models import Q
from blog.models import BlogPost
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import LessonSerializer

def check(request):
    return render(request, '03-online-school.html')


def index(request):
    lang = request.GET.get("lang", "en")

    posts = BlogPost.objects.filter(is_published=True).order_by("-published_at")[:4]

    return render(request, "index-5.html", {
        "lang": lang,
        "posts": posts,
    })



def lesson_list(request, age_group=None):
    lang = request.GET.get("lang", "en")
    query = request.GET.get("q", "")
    category_id = request.GET.get("category")

    lessons = Lesson.objects.all().order_by("category__order", "order", "created_at")
    categories = LessonCategory.objects.all().order_by("order")

    if age_group:
        lessons = lessons.filter(age_group=age_group)

    if category_id:
        lessons = lessons.filter(category_id=category_id)

    if query:
        lessons = lessons.filter(title__icontains=query)

    paginator = Paginator(lessons, 12)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    return render(request, "lessons/list.html", {
        "page_obj": page_obj,
        "categories": categories,
        "selected_category": int(category_id) if category_id else None,
        "age_group": age_group,
        "lessons_count": lessons.count(),
        "query": query,
        "lang": lang,
    })


def lesson_detail(request, pk):
    lang = request.GET.get("lang", "en")
    lesson = get_object_or_404(Lesson, pk=pk)
    blocks = lesson.blocks.all() 

    related_quizzes = Quiz.objects.filter(lesson=lesson)
    related_worksheets = Worksheet.objects.filter(lesson=lesson)

    return render(request, "lessons/detail.html", {
        "lesson": lesson,
        "related_quizzes": related_quizzes,
        "related_worksheets": related_worksheets,
        "lang": lang,
        "blocks": blocks,
    })


class LessonListAPIView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = LessonSerializer

    def get_queryset(self):
        qs = (
            Lesson.objects
            .select_related("category")
            .prefetch_related("blocks")
            .order_by("category__order", "order", "created_at")
        )

        age_group = self.request.query_params.get("age_group")
        category_id = self.request.query_params.get("category")
        q = self.request.query_params.get("q")

        if age_group:
            qs = qs.filter(age_group=age_group)

        if category_id:
            qs = qs.filter(category_id=category_id)

        if q:
            # Simple search (EN title). If you want multilingual search like your search_view, tell me.
            qs = qs.filter(title__icontains=q)

        return qs


class LessonDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = LessonSerializer
    queryset = Lesson.objects.select_related("category").prefetch_related("blocks")

def search_view(request):
    lang = request.GET.get("lang", "en")
    query = request.GET.get("q", "").strip()
    age_group = request.GET.get("age_group", "")

    # default empty QuerySets
    lessons = Lesson.objects.none()
    worksheets = Worksheet.objects.none()
    quizzes = Quiz.objects.none()

    if query:
        # 🔹 search in ALL lesson language fields
        lessons = Lesson.objects.filter(
            Q(title__icontains=query) |
            Q(title_sr__icontains=query) |
            Q(title_de__icontains=query) |
            Q(description__icontains=query) |
            Q(description_sr__icontains=query) |
            Q(description_de__icontains=query)
        )

        # 🔹 keep worksheets & quizzes simple for now (EN fields only)
        worksheets = Worksheet.objects.filter(
            Q(title__icontains=query) | Q(description__icontains=query)
        )
        quizzes = Quiz.objects.filter(title__icontains=query)

    # 🔹 age filters
    if age_group:
        lessons = lessons.filter(age_group=age_group)
        worksheets = worksheets.filter(age_group=age_group) if hasattr(Worksheet, "age_group") else worksheets
        quizzes = quizzes.filter(age_group=age_group) if hasattr(Quiz, "age_group") else quizzes

    context = {
        "lang": lang,
        "query": query,
        "age_group": age_group,
        "lessons_preview": lessons[:6],
        "lessons_count": lessons.count(),
        "quizzes_preview": quizzes[:6],
        "quizzes_count": quizzes.count(),
        "worksheets_preview": worksheets[:6],
        "worksheets_count": worksheets.count(),
        "disable_lang_switcher": True,
    }
    return render(request, "search/results.html", context)

def lessons_show_all(request):
    lang = request.GET.get("lang", "en")
    query = request.GET.get("q")
    age_group = request.GET.get("age_group")
    lessons = Lesson.objects.all()

    if query:
        lessons = lessons.filter(title__icontains=query)

    if age_group:
        lessons = lessons.filter(age_group=age_group)

    return render(request, "lessons/lessons_show_all.html", {
        "lessons": lessons,
        "query": query,
        "age_group": age_group,
        "lang": lang,
        "disable_lang_switcher": True, 
    })



def worksheets_show_all(request):
    lang = request.GET.get("lang", "en")
    query = request.GET.get("q", "")
    age_group = request.GET.get("age_group", "")

    worksheets = Worksheet.objects.all().order_by("-uploaded_at")

    # 🔍 Text search
    if query:
        worksheets = worksheets.filter(title__icontains=query)

    # 👶 Age filter (if you add age groups later)
    if age_group:
        worksheets = worksheets.filter(age_group=age_group)

    context = {
        "lang": lang,
        "worksheets": worksheets,
        "query": query,
        "age_group": age_group,

        # 🔒 Hide language switcher on this page
        "disable_lang_switcher": True,
    }

    return render(request, "search/worksheets_show_all.html", context)


def contact(request):
    lang = request.GET.get("lang", "en")

    if request.method == "POST":
        name = request.POST.get("name")
        email = request.POST.get("email")
        msg = request.POST.get("message")

        if name and email and msg:
            ContactMessage.objects.create(name=name, email=email, message=msg)

            if lang == "sr":
                messages.success(request, "✅ Hvala! Poruka je uspešno poslata. Uskoro odgovaramo!")
            elif lang == "de":
                messages.success(request, "✅ Danke! Deine Nachricht wurde gesendet. Wir melden uns bald!")
            else:
                messages.success(request, "✅ Thank you! Your message has been sent successfully. We'll reply soon!")

            return redirect(f"/contact/?lang={lang}")
        else:
            if lang == "sr":
                messages.error(request, "⚠️ Molimo popunite sva polja.")
            elif lang == "de":
                messages.error(request, "⚠️ Bitte fülle alle Felder aus.")
            else:
                messages.error(request, "⚠️ Please fill in all fields before submitting.")

    return render(request, "contact.html", {"lang": lang})