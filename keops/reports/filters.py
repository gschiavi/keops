import markupsafe
import datetime
import decimal

from django.utils import formats


def localize(value):
    if value is None:
        return ''
    elif isinstance(value, (decimal.Decimal, float)):
        return formats.number_format(value, 2)
    elif isinstance(value, datetime.datetime):
        return formats.date_format(value, 'SHORT_DATETIME_FORMAT')
    elif isinstance(value, datetime.date):
        return formats.date_format(value, 'SHORT_DATE_FORMAT')
    return str(value)


def linebreaks(text):
    return text.replace('\n', markupsafe.Markup('<br/>'))
