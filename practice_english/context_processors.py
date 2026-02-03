# practice_english/context_processors.py
from django.conf import settings

def active_language(request):
    """
    Reads ?lang= from URL, falls back to session, defaults to 'en'.
    Makes `lang` available in all templates.
    """
    supported = {code for code, _ in getattr(settings, "LANGUAGES", [("en", "English")])}

    lang = request.GET.get("lang") or request.session.get("lang") or "en"

    if lang not in supported:
        lang = "en"

    # remember choice in session
    request.session["lang"] = lang

    return {"lang": lang}
