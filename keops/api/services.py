import datetime
import decimal
from itertools import chain
from collections import defaultdict
import base64
import tempfile
from django.utils.translation import gettext
from django.core.exceptions import ObjectDoesNotExist, FieldDoesNotExist, ValidationError
from django.conf import settings
from django.db.models import ForeignKey, ImageField
from django.template import loader
from django.http import HttpResponse, JsonResponse
from django.utils.text import capfirst
from django.utils.encoding import force_str
from django.db.models import Q, Count
from django.apps import apps
from django.db.models.query_utils import DeferredAttribute
from django.db import models
from django.db.models.fields.related import ManyToOneRel, ManyToManyField
from django.db.models import DecimalField, DateField, CharField, FileField
from django.db.models import QuerySet
from django.db.models import NOT_PROVIDED, BooleanField

from keops.models.fields import OneToManyField
from .decorators import service_method


PAGE_SIZE = 100


class ViewService(object):
    name = None
    site = None

    def __init__(self, request):
        self.request = request

    @classmethod
    def init_service(cls):
        pass

    def dispatch_action(self, action_id):
        raise NotImplementedError()


class ModelService(ViewService):
    ready = False
    model = None
    group_fields = None
    writable_fields = None
    readable_fields = None
    title_field = None
    list_fields = None
    extra_fields = None
    search_fields = None
    field_dependencies = None
    fields_choices = None
    select_related = None

    def __init__(self, request):
        super(ModelService, self).__init__(request)
        self.post_data = defaultdict(dict)
        self.m2m = {}

    @classmethod
    def init_service(cls):
        if not cls.name:
            cls.name = str(cls.model._meta)
        if cls.title_field is None:
            try:
                cls.title_field = cls.model._meta.get_field('name').name
            except FieldDoesNotExist:
                pass
        if cls.extra_fields:
            for f in cls.extra_fields:
                f.model = cls.model

    def _save_children(self, field, value, parent_id):
        rel_model = field.related_model
        remote_field = field.remote_field.attname
        for v in value:
            obj = None
            vals = v.get('values')
            if v['action'] == 'DESTROY':
                rel_model.objects.filter(pk=v['id'], **{remote_field: parent_id}).delete()
                continue
            elif v['action'] == 'CREATE':
                obj = rel_model()
                vals[remote_field] = parent_id
            elif v['action'] == 'UPDATE':
                obj = rel_model._default_manager.get(pk=v['values']['id'])
            self.deserialize(obj, v['values'])

    def deserialize_value(self, instance, field, value):
        field_name = field.name

        if isinstance(field, ManyToManyField):
            self.m2m[field.name] = value
            return

        if value == '':
            value = None
        if isinstance(field, ManyToOneRel):
            self.post_data[id(instance)][field] = value
            return
        elif isinstance(field, ForeignKey):
            field_name = field.attname
            if isinstance(value, list):
                value = value[0]
        elif isinstance(field, FileField) and value:
            data = value.split('data:', 1)
            if len(data) > 1:
                file_content = data[1].split(';base64,')[1]
                if callable(field.upload_to):
                    fname = field.upload_to(instance, None)
                else:
                    fname = NotImplemented
                with open(fname, 'wb') as f:
                    f.write(base64.decodebytes(file_content.encode('utf-8')))
                value = fname
            else:
                raise ValidationError('Invalid file field value.')
        elif isinstance(field, DecimalField):
            if isinstance(value, (str, float)):
                value = round(decimal.Decimal(str(value)), field.decimal_places)
        elif isinstance(field, DateField):
            # Try ISO date format before
            for format in chain(['%Y-%m-%d'], settings.DATE_INPUT_FORMATS):
                try:
                    value = datetime.datetime.strptime(force_str(value), format).date()
                    break
                except (ValueError, TypeError):
                    continue
        elif isinstance(field, CharField):
            if value is None:
                value = ''
            value = str(value)

        setattr(instance, field_name, value)

    def deserialize(self, instance, data):
        data.pop('id', None)
        file_fields = {}
        for k, v in data.items():
            field = instance.__class__._meta.get_field(k)
            if isinstance(field, FileField):
                file_fields[field] = v
            else:
                self.deserialize_value(instance, field, v)

        # Processing File Fields
        for k, v in file_fields.items():
            self.deserialize_value(instance, k, v)

        instance.full_clean()
        if instance.pk:
            flds = data.keys() - [f.name for f in self.post_data[id(instance)].keys()] - self.m2m.keys()
            if flds:
                instance.save(update_fields=flds)
        else:
            instance.save()

        post_data = self.post_data.pop(id(instance), None)

        for k, v in self.m2m.items():
            m2m_field = getattr(instance, k)
            m2m_field.clear()

        for k, v in self.m2m.items():
            m2m_field = getattr(instance, k)
            m = m2m_field.through
            for vi in v:
                m.objects.create(**{
                    m2m_field.target_field_name: m2m_field.model.objects.get(pk=vi),
                    m2m_field.source_field_name: instance,
                })

        if post_data:
            for f, v in post_data.items():
                self._save_children(f, v, instance.pk)
        return instance

    def serialize_value(self, instance, field):
        try:
            v = getattr(instance, field.name)
            if v is not None:
                if isinstance(field, ImageField):
                    return v.name
                elif isinstance(field, FileField):
                    return None
                elif isinstance(field, ForeignKey):
                    return [v.pk, str(v)]
                elif isinstance(field, ManyToManyField):
                    return [(v.pk, str(v)) for v in v.all()]
                elif isinstance(field, DateField):
                    return str(v)
                elif field.choices:
                    return str(v)
                elif isinstance(field, CharField):
                    return str(v)

        except FieldDoesNotExist:
            return getattr(instance, field.name)
        return getattr(instance, field.attname)

    def serialize(self, instance, fields=None, exclude=None, view_type=None):
        opts = instance._meta
        data = {}
        deferred_fields = instance.get_deferred_fields()
        for f in chain(opts.concrete_fields, opts.private_fields, opts.many_to_many):
            if f.attname in deferred_fields or isinstance(f, OneToManyField):
                continue
            if not getattr(f, 'editable', False):
                continue
            if fields and f.name not in fields:
                continue
            if exclude and f.name in exclude:
                continue
            data[f.name] = self.serialize_value(instance, f)
        if 'id' not in data:
            data['id'] = instance.pk
        data['display_name'] = str(instance)
        return data

    def get_fields_info(self, view_type):
        opts = self.model._meta
        r = {}
        if view_type == 'search':
            fields = self.searchable_fields
        else:
            fields = chain(opts.fields, opts.many_to_many, self.extra_fields or [])
        for field in fields:
            r[field.name] = self.get_field_info(field)
        return r

    def get_field_info(self, field):
        info = {
            'name': field.name,
            'help_text': field.help_text,
            'required': not field.blank,
            'readonly': not field.editable,
            'editable': field.editable,
            'type': field.get_internal_type(),
            'caption': capfirst(field.verbose_name),
            'max_length': field.max_length,
        }
        if self.field_dependencies and field.name in self.field_dependencies:
            info['depends'] = self.field_dependencies[field.name]
        if isinstance(field, ForeignKey):
            info['model'] = str(field.related_model._meta)
        elif isinstance(field, OneToManyField):
            field = getattr(self.model, field.related_name)
            info['field'] = str(field.rel.field.name)
            info['model'] = str(field.rel.related_model._meta)
        elif isinstance(field, DecimalField):
            info['decimal_places'] = field.decimal_places
        elif self.fields_choices and field.name in self.fields_choices:
            choices = self.fields_choices[field.name]
            if callable(choices):
                choices = choices()
            info['choices'] = choices
        elif field.choices:
            info['choices'] = field.choices
        return info

    @service_method
    def get(self, id):
        return self._search(params={'pk': id})[0]

    def get_names(self, queryset):
        return [self.get_name(obj) for obj in queryset]

    def get_name(self, instance):
        return [instance.pk, str(instance)]

    @service_method
    def get_defaults(self):
        r = {}
        for f in self.model._meta.fields:
            if f.default is not NOT_PROVIDED:
                if callable(f.default):
                    r[f.name] = f.default()
                else:
                    r[f.name] = f.default
            elif isinstance(f, BooleanField):
                r[f.name] = False
        return r or None

    def filter(self, count=None, page=None, *args, **kwargs):

        def to_date(val):
            if '/' in val:
                fmt = '%d/%m/%Y'
            else:
                fmt = '%d%m%Y'
            return datetime.datetime.strptime(val, fmt)

        def set_param(param):
            for p, v in param.items():
                field_name = f = p.split('__', 1)[0]
                f = self.model._meta.get_field(f)
                if isinstance(f, models.DateField):
                    v = v.replace('-', ' ')
                    if ' ' in v:
                        field_name += '__range'
                        v1, v2 = v.split(' ')
                        v1 = to_date(v1)
                        v2 = to_date(v2)
                        v = (v1, v2)
                    else:
                        v = to_date(v)
                return {field_name: v}
            return param

        params = kwargs.get('params', {}) or {}
        qs = self.model.objects.all()
        if isinstance(params, Q):
            qs = qs.filter(params)
        elif params:
            if not isinstance(params, (list, tuple)):
                params = [params]
            for param in params:
                if isinstance(param, dict) and 'OR' in param:
                    q = None
                    for p in param['OR']:
                        p = set_param(p)
                        if q is None:
                            q = Q(**p)
                        else:
                            q |= Q(**p)
                    qs = qs.filter(q)
                else:
                    param = set_param(param)
                    qs = qs.filter(**param)

        if self.select_related:
            qs = qs.select_related(*tuple(self.select_related))

        # Check rules
        if not self.request.user.is_superuser:
            from keops.contrib.base.models import Rule

            rules = Rule.objects.filter(model=self.name, active=True)
            for rule in rules:
                if rule.domain:
                    try:
                        domain = eval(rule.domain, None, {'user': self.request.user, 'request': self.request})
                        for k, v in domain.items():
                            if isinstance(v, QuerySet):
                                domain[k] = [obj.pk for obj in v]
                        qs = qs.filter(**domain)
                    except Exception as e:
                        print('Error applying rule', e)
        return qs

    def _search(self, count=None, page=None, *args, **kwargs):
        qs = self.filter(count=count, page=page, *args, **kwargs)
        _count = None
        if count:
            _count = qs.count()
        if page:
            page = int(page)
        else:
            page = 1
        offset = 0
        if page > 1:
            offset = (page - 1) * PAGE_SIZE

        qs = qs[offset:offset + PAGE_SIZE]
        qs._count = _count
        return qs

    @service_method
    def search(self, *args, **kwargs):
        qs = self._search(*args, **kwargs)
        count = qs._count
        if self.list_fields:
            qs = qs.only(*self.list_fields)
        qs._count = count
        return qs

    @service_method
    def search_names(self, *args, **kwargs):
        qs = self._search(*args, **kwargs)[:PAGE_SIZE]
        return self.get_names(qs)

    @service_method
    def write(self, data):
        objs = []
        for row in data:
            pk = row.pop('id', None)
            if pk:
                obj = self.get(pk)
            else:
                obj = self.model()
            self.deserialize(obj, row)
            objs.append(obj.pk)
        return objs

    @service_method
    def destroy(self, ids):
        ids = [v[0] for v in self._search(params={'id__in': ids}).only('pk').values_list('pk')]
        self.model.objects.filter(id__in=ids).delete()
        if not ids:
            raise ObjectDoesNotExist()
        return {
            'id': ids,
        }

    @service_method
    def get_view_info(self, view_type):
        return {
            'content': self.window_view(view_type),
            'fields': self.get_fields_info(view_type),
            'view_actions': self.get_view_actions(view_type),
        }

    @service_method
    def load_views(self, views=None):
        if views is None:
            views = ['form', 'list', 'search']
        return {v: self.get_view_info(v) for v in views}

    @property
    def searchable_fields(self):
        if self.search_fields:
            for f in self.search_fields:
                yield self.model._meta.get_field(f.split('__')[0])
        elif self.title_field:
            yield self.model._meta.get_field(self.title_field)

    @property
    def groupable_fields(self):
        if self.group_fields:
            for f in self.group_fields:
                yield self.model._meta.get_field(f.split('__')[0])

    def get_view_actions(self, view_type):
        return []

    def window_view(self, view_type):
        templ_name = '%s.html' % view_type
        templ = loader.select_template([
            'keops/web/admin/actions/%s/%s' % (self.name, templ_name),
            'keops/web/admin/actions/%s' % templ_name,
        ], 'jinja2')
        fields = self.model._meta.fields
        if view_type == 'list':
            if self.list_fields:
                fields = {f.name: f for f in fields if f.name in self.list_fields}
                fields = [fields[f] for f in self.list_fields]
        elif view_type == 'form':
            fields = chain(fields, self.model._meta.many_to_many)
        return templ.render({
            'opts': self.model._meta,
            'fields': fields,
            'request': self.request,
            'service': self,
        })

    @service_method
    def get_field_choices(self, field):
        field = self.model._meta.get_field(field)
        service = str(field.related_model._meta).lower()
        if service in self.site.services:
            service = self.site.services[service](self.request)
            q = self.request.GET.get('q', None)
            params = None
            if q:
                params = Q()
                if service.search_fields:
                    for s in service.search_fields:
                        params |= Q(**{s: q})
                else:
                    params = {service.title_field + '__icontains': q}
            d = service.search_names(params=params)
            return {
                'items': d
            }

    @service_method
    def group_by(self, grouping, *args, **kwargs):
        qs = self.filter(*args, **kwargs)
        field = self.model._meta.get_field(grouping[0])
        if isinstance(field, ForeignKey):
            # Load manually
            qs = qs.values(*grouping).annotate(count=Count(grouping[0])).order_by()
            keys = {k[field.name]: k['count'] for k in qs}
            labels = field.remote_field.model.objects.filter(pk__in=keys.keys())
            qs = [{field.name: [obj.pk, str(obj)], 'count': keys[obj.pk]} for obj in labels]
        else:
            qs = list(qs.values(*grouping).annotate(count=Count(grouping[0])).order_by())
            # get fk string
        return qs

    @service_method
    def do_view_action(self, action_name, target, **kwargs):
        return self.dispatch_view_action(action_name, target, **kwargs)

    @service_method
    def copy(self, id):
        def copy(cls, id):
            obj = cls.get(id)
            new_item = {}
            fields = []
            for f in cls._meta.fields:
                if f.copy:
                    fields.append(f.name)
                    if self.title_field == f.name:
                        new_item[f.name] = gettext('%s (copy)') % getattr(obj, f.name)
                    else:
                        new_item[f.name] = getattr(obj, f.name)
            fields.append('display_name')
            new_item = self.model(**new_item)
            return new_item.serialize(fields=fields)

    def dispatch_view_action(self, action_name, target):
        raise NotImplemented()

    def view_action(self, view_type):
        return JsonResponse({
            'model': [None, self.name],
            'action_type': 'WindowAction',
            'view_mode': 'list,form',
            'display_name': capfirst(self.model._meta.verbose_name_plural),
        })

    def dispatch_action(self, action_id):
        from keops.contrib.base.models import Action
        if isinstance(action_id, Action):
            return action_id.dispatch_action(self)
        elif action_id == 'view':
            view_type = self.request.GET.get('view_type', 'list')
            return self.view_action(view_type)
