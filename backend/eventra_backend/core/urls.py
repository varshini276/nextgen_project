# core/urls.py
# ─────────────────────────────────────────────────────────────
#  Eventra — URL Configuration
#  All your existing routes are preserved.
#  Three new ticket routes are added at the bottom.
# ─────────────────────────────────────────────────────────────

from django.urls import path
from . import views

urlpatterns = [

    # FRONTEND ROUTES

    path('', views.home),              # ✅ HOME FIRST
    # path('login/', views.login_view),  # ✅ LOGIN PAGE
    path('home/', views.home),        # optional

    path('login/', views.login_user, name='login'),
    path('register/', views.register_user),
    path('logout/', views.logout_user),

    # path('register/', views.register_view),
    path('dashboard/', views.dashboard, name='dashboard'),

    path('events/', views.events_page),
    path('add-event/', views.add_event),
    path('event-details/', views.event_details),
    path('registration/', views.registration),
    path('review-rating/', views.review_rating),
    path('admin-page/', views.admin_page),

    # API ROUTES
    path('api/events/', views.events),
    path('api/users/', views.users),
    path('api/registrations/', views.registrations),
    path('api/reviews/', views.reviews),

    # ── NEW: TICKET PAGE (serves ticket.html template) ───────
    path('ticket/', views.ticket_page),

    # ── NEW: TICKET API ROUTES ────────────────────────────────
    #
    #  POST /generate-ticket/
    #    Body: { name, email, eventTitle, eventDate, eventTime,
    #            eventLocation, organiser, ticketType }
    #    Returns: { success: true, ticketId: "EVT-XXXXXXXX" }
    #
    path('generate-ticket/', views.generate_ticket),

    #  GET /qr/<ticket_id>/
    #    Returns: PNG image of QR code
    #
    path('qr/<str:ticket_id>/', views.generate_qr),

    #  GET /verify/<ticket_id>/
    #    Returns: HTML verification page
    #    First visit  → marks ticket used → shows VALID
    #    Second visit → shows ALREADY USED
    #
    path('verify/<str:ticket_id>/', views.verify_ticket),
]