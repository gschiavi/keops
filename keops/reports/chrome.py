import os
import subprocess
import uuid
import pathlib
from django.conf import settings
from django.db import connection
import mako.template
import mako.lookup
from xml.etree import ElementTree as et


def report_static_uri(uri):
    if uri.startswith('/'):
        uri = uri[1:]
    return pathlib.Path(os.path.join(settings.REPORT_TEMPLATES_DIR, 'static', uri)).as_uri()


class ReportEngine:
    lookup = mako.lookup.TemplateLookup(
        [settings.REPORT_TEMPLATES_DIR],
        imports=['from keops.reports.filters import localize, linebreaks'],
        default_filters=['localize'],
        input_encoding='utf-8',
        output_encoding='utf-8'
    )
    def __init__(self, fname, *args, **kwargs):
        self.filename = fname
        self.load()

    def load(self):
        self.report = self.lookup.get_template(self.filename)

    def render(self, **kwargs):
        def query(cmd, *args, **kwargs):
            sql = kwargs.get('sql')
            with connection.cursor() as cur:
                cur.execute(cmd, *args, **kwargs)
                rows = cur.fetchall()
            return rows

        kwargs['report_static_uri'] = report_static_uri
        return self.report.render(select=query, **kwargs)

    def to_pdf(self, **kwargs):
        data = kwargs.get('data')
        # Get sql
        sqls = ['1 = 1']

        for param in data:
            if 'value1' in param and param['value1']:
                val1 = param['value1']
                val2 = param.get('value2')
                if param['type'] == 'DateTimeField':
                    if val1:
                        val1 = "TO_DATE('%s', 'yyyy-mm-dd')" % val1
                    if val2:
                        val2 = "TO_DATE('%s', 'yyyy-mm-dd')" % val2
                if param['op'] == 'contains':
                    sqls.append("upper({0}) like upper('%{1}%')".format(param['name'], param['value1']))
                elif param['op'] == 'startsWith':
                    sqls.append("upper({0}) like upper('{1}%')".format(param['name'], param['value1']))
                elif param['op'] == 'equals':
                    sqls.append("{0} = '{1}'".format(param['name'], param['value1']))
                elif param['op'] == 'between':
                    sqls.append("{0} BETWEEN {1} and {2}".format(param['name'], val1, val2))
        sql = ' AND '.join(sqls)
        kwargs['sql'] = sql

        xml = self.render(**kwargs)
        fname = uuid.uuid4().hex + '.html'
        file_path = os.path.join(settings.REPORT_ROOT, fname)
        output_path = file_path + '.pdf'
        with open(file_path, 'wb') as tmp:
            tmp.write(xml)
            tmp.close()
            subprocess.call([settings.CHROME_PATH, '--headless', '--file=' + file_path, output_path, '--javascript'])
            return fname + '.pdf'
