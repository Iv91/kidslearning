from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from .models import Worksheet


def resources_home(request):
    lang = request.GET.get("lang", "en")
    query = request.GET.get("q", "")

    worksheets = Worksheet.objects.all().order_by("-uploaded_at")

    if query:
        worksheets = worksheets.filter(title__icontains=query) | worksheets.filter(description__icontains=query)

    paginator = Paginator(worksheets, 12)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    return render(request, "resources/home.html", {
        "page_obj": page_obj,
        "worksheets_count": worksheets.count(),
        "query": query,
        "lang": lang,
    })


def resource_detail(request, pk):
    lang = request.GET.get("lang", "en")
    worksheet = get_object_or_404(Worksheet, pk=pk)

    return render(request, "resources/detail.html", {
        "worksheet": worksheet,
        "lang": lang,
    })