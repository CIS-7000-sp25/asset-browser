# Generated by Django 5.1.6 on 2025-03-28 06:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0005_author_remove_asset_thumbnailfilepath_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='asset',
            name='s3link',
            field=models.CharField(default='', max_length=200),
            preserve_default=False,
        ),
    ]
