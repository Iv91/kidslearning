from django import template

register = template.Library()

@register.filter
def get_title(lesson, lang):
    if lang == "sr" and lesson.title_sr:
        return lesson.title_sr
    if lang == "de" and lesson.title_de:
        return lesson.title_de
    return lesson.title

@register.filter
def get_description(lesson, lang):
    if lang == "sr" and lesson.description_sr:
        return lesson.description_sr
    if lang == "de" and lesson.description_de:
        return lesson.description_de
    return lesson.description

@register.filter
def get_block_title(block, lang):
    if lang == "sr" and block.title_sr:
        return block.title_sr
    if lang == "de" and block.title_de:
        return block.title_de
    return block.title