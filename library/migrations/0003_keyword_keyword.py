# Generated by Django 5.1.6 on 2025-02-20 16:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0002_remove_keyword_keyword'),
    ]

    operations = [
        migrations.AddField(
            model_name='keyword',
            name='keyword',
            field=models.CharField(default='', max_length=200, unique=True),
        ),
    ]
