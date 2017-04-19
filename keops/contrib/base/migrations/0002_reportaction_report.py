# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2017-04-19 03:16
from __future__ import unicode_literals

from django.db import migrations
import django.db.models.deletion
import keops.models.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('base', '0001_initial'),
        ('keops', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='reportaction',
            name='report',
            field=keops.models.fields.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='keops.Report'),
        ),
    ]
