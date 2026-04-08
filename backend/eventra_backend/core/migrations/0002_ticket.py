# core/migrations/0002_ticket.py
# ─────────────────────────────────────────────────────────────
#  Migration: adds the Ticket model
#  Place this file in:  core/migrations/0002_ticket.py
#  Then run:  python manage.py migrate
# ─────────────────────────────────────────────────────────────

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        # depends on your initial migration
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id',             models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ticket_id',      models.CharField(max_length=20, unique=True, editable=False)),
                ('name',           models.CharField(max_length=200)),
                ('email',          models.EmailField(max_length=254)),
                ('event_title',    models.CharField(max_length=300)),
                ('event_date',     models.CharField(max_length=100, blank=True)),
                ('event_time',     models.CharField(max_length=100, blank=True)),
                ('event_location', models.CharField(max_length=300, blank=True)),
                ('organiser',      models.CharField(max_length=200, blank=True)),
                ('ticket_type',    models.CharField(max_length=100, blank=True, default='General')),
                ('is_used',        models.BooleanField(default=False)),
                ('used_at',        models.DateTimeField(null=True, blank=True)),
                ('created_at',     models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]