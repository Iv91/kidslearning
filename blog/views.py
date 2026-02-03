from django.shortcuts import render
from django.shortcuts import render, get_object_or_404
from .models import BlogPost

def blog_list(request):
    lang = request.GET.get("lang", "en")

    posts = BlogPost.objects.filter(
        is_published=True
    ).order_by("-published_at")

    return render(request, "blog/blog_list.html", {
        "posts": posts,
        "lang": lang,
    })

def blog_detail(request, slug):
    lang = request.GET.get("lang", "en")
    post = get_object_or_404(BlogPost, slug=slug, is_published=True)
    return render(request, "blog/blog_detail.html", {"post": post, "lang": lang})
