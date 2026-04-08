# core/models.py
# ─────────────────────────────────────────────────────────────
#  Eventra — Database Models
#  Adds the Ticket model alongside your existing models.
# ─────────────────────────────────────────────────────────────

from django.db import models
import uuid


class Event(models.Model):
    """Your existing Event model — unchanged."""
    title       = models.CharField(max_length=100)
    description = models.TextField()
    date        = models.CharField(max_length=50)

    def __str__(self):
        return self.title


class Registration(models.Model):
    """Your existing Registration model — unchanged."""
    name    = models.CharField(max_length=100)
    email   = models.EmailField()
    phone   = models.CharField(max_length=15)
    event   = models.CharField(max_length=100)
    tickets = models.IntegerField()
    amount  = models.IntegerField()

    def __str__(self):
        return f"{self.name} — {self.event}"


class Review(models.Model):
    """Your existing Review model — unchanged."""
    name    = models.CharField(max_length=100)
    rating  = models.IntegerField()
    comment = models.TextField()

    def __str__(self):
        return f"{self.name} ({self.rating}★)"


# ─────────────────────────────────────────────────────────────
#  NEW: Ticket model
#  One row is created per registered attendee.
#  ticket_id is a short unique code like "EVT-A3F8B21C".
# ─────────────────────────────────────────────────────────────
class Ticket(models.Model):
    # Unique ticket identifier (e.g. EVT-A3F8B21C)
    ticket_id      = models.CharField(max_length=20, unique=True, editable=False)

    # Attendee info (from the registration form)
    name           = models.CharField(max_length=200)
    email          = models.EmailField()

    # Event info (passed from events.html → event-details.html → here)
    event_title    = models.CharField(max_length=300)
    event_date     = models.CharField(max_length=100, blank=True)
    event_time     = models.CharField(max_length=100, blank=True)
    event_location = models.CharField(max_length=300, blank=True)
    organiser      = models.CharField(max_length=200, blank=True)
    ticket_type    = models.CharField(max_length=100, blank=True, default="General")

    # State
    is_used        = models.BooleanField(default=False)
    used_at        = models.DateTimeField(null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Auto-generate ticket_id on first save
        if not self.ticket_id:
            self.ticket_id = "EVT-" + uuid.uuid4().hex[:8].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ticket_id} — {self.name} ({self.event_title})"

    class Meta:
        ordering = ["-created_at"]