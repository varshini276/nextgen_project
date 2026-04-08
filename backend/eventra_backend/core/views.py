# core/views.py
# ─────────────────────────────────────────────────────────────
#  Eventra — Views
#  Keeps all your existing views intact and adds:
#    • generate_ticket  (POST /generate-ticket/)
#    • generate_qr      (GET  /qr/<ticket_id>/)
#    • verify_ticket    (GET  /verify/<ticket_id>/)
#    • ticket_page      (GET  /ticket/)   ← serves ticket.html
# ─────────────────────────────────────────────────────────────
from email.mime.image import MIMEImage
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
import json
import qrcode
import io
import base64

from .models import Ticket


# ════════════════════════════════════════════════════════════
#  EXISTING FRONTEND PAGE VIEWS  (unchanged)
# ════════════════════════════════════════════════════════════

def home(request):
    return render(request, 'home.html')


def register_user(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        User.objects.create_user(
            username=email,
            email=email,
            password=password
        )

        return redirect('/login/')

    return render(request, 'register.html')


def login_user(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        user = authenticate(request, username=email, password=password)

        if user:
            login(request, user)
            return redirect('/dashboard/')
        else:
            return render(request, 'login.html', {'error': 'Invalid credentials'})

    return render(request, 'login.html')

# @login_required(login_url='/login/')
def dashboard(request):
    return render(request, 'dashboard.html')

def events_page(request):
    return render(request, 'events.html')

def add_event(request):
    return render(request, 'add-event.html')

def event_details(request):
    return render(request, 'event-details.html')

def registration(request):
    return render(request, 'registration.html')

def review_rating(request):
    return render(request, 'review-rating.html')

def admin_page(request):
    return render(request, 'admin.html')

def logout_user(request):
    logout(request)
    return redirect('/')

# NEW: serves ticket.html as a Django template
def ticket_page(request):
    return render(request, 'ticket.html')


# ════════════════════════════════════════════════════════════
#  EXISTING API VIEWS  (unchanged)
# ════════════════════════════════════════════════════════════

events_data        = []
users_data         = []
registrations_data = []
reviews_data       = []

def events(request):
    if request.method == 'GET':
        return JsonResponse(events_data, safe=False)
    if request.method == 'POST':
        data = json.loads(request.body)
        events_data.append(data)
        return JsonResponse(data)

def users(request):
    if request.method == 'GET':
        return JsonResponse(users_data, safe=False)
    if request.method == 'POST':
        data = json.loads(request.body)
        users_data.append(data)
        return JsonResponse(data)

def registrations(request):
    if request.method == 'GET':
        return JsonResponse(registrations_data, safe=False)
    if request.method == 'POST':
        data = json.loads(request.body)
        registrations_data.append(data)
        return JsonResponse(data)

def reviews(request):
    if request.method == 'GET':
        return JsonResponse(reviews_data, safe=False)
    if request.method == 'POST':
        data = json.loads(request.body)
        reviews_data.append(data)
        return JsonResponse(data)


# ════════════════════════════════════════════════════════════
#  NEW VIEW 1 — POST /generate-ticket/
#
#  Accepts JSON body:
#    { name, email, eventTitle, eventDate, eventTime,
#      eventLocation, organiser, ticketType }
#
#  Creates a Ticket row in the database, sends a confirmation
#  email, and returns { success: true, ticketId }.
# ════════════════════════════════════════════════════════════
@csrf_exempt                          # allow cross-origin POST from your HTML frontend
@require_http_methods(["POST"])
def generate_ticket(request):
    print("GENERATE TICKET CALLED")
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid JSON body."}, status=400)

    name         = (body.get("name")          or "").strip()
    email        = (body.get("email")         or "").strip()
    event_title  = (body.get("eventTitle")    or "").strip()
    event_date   = (body.get("eventDate")     or "").strip()
    event_time   = (body.get("eventTime")     or "").strip()
    event_loc    = (body.get("eventLocation") or "").strip()
    organiser    = (body.get("organiser")     or "").strip()
    ticket_type  = (body.get("ticketType")    or "General").strip()

    # ── Validate required fields ──────────────────────────────
    if not name:
        return JsonResponse({"success": False, "error": "Field 'name' is required."}, status=400)
    if not event_title:
        return JsonResponse({"success": False, "error": "Field 'eventTitle' is required."}, status=400)

    # ── Create ticket in database ─────────────────────────────
    ticket = Ticket.objects.create(
        name           = name,
        email          = email,
        event_title    = event_title,
        event_date     = event_date,
        event_time     = event_time,
        event_location = event_loc,
        organiser      = organiser,
        ticket_type    = ticket_type,
    )

    # ── Send confirmation email (non-blocking attempt) ────────
    if email:
        _send_confirmation_email(ticket)

    return JsonResponse({"success": True, "ticketId": ticket.ticket_id})


# ════════════════════════════════════════════════════════════
#  NEW VIEW 2 — GET /qr/<ticket_id>/
#
#  Generates and returns a QR code PNG image.
#  The QR encodes the verify URL so scanning opens the
#  verify page directly.
# ════════════════════════════════════════════════════════════
def generate_qr(request, ticket_id):
    # Check ticket exists
    try:
        Ticket.objects.get(ticket_id=ticket_id)
    except Ticket.DoesNotExist:
        return HttpResponse("Ticket not found.", status=404, content_type="text/plain")

    # Build the verify URL that the QR will encode
    verify_url = request.build_absolute_uri(f"/verify/{ticket_id}/")

    # Generate QR image
    qr = qrcode.QRCode(
        version              = 1,
        error_correction     = qrcode.constants.ERROR_CORRECT_H,
        box_size             = 10,
        border               = 4,
    )
    qr.add_data(verify_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#3a2a3e", back_color="white")

    # Write PNG to a bytes buffer and return as HTTP response
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return HttpResponse(buf.read(), content_type="image/png")


# ════════════════════════════════════════════════════════════
#  NEW VIEW 3 — GET /verify/<ticket_id>/
#
#  Shows an HTML verification page.
#  • First scan  → marks ticket as used → VALID (green)
#  • Later scans → ALREADY USED (amber)
#  • Not found   → INVALID (red)
# ════════════════════════════════════════════════════════════
def verify_ticket(request, ticket_id):
    try:
        ticket = Ticket.objects.get(ticket_id=ticket_id)
    except Ticket.DoesNotExist:
        return render(request, "verify.html", {
            "status":  "INVALID",
            "icon":    "❌",
            "color":   "#e07090",
            "heading": "Ticket Not Found",
            "detail":  f"No ticket with ID {ticket_id} exists.",
            "ticket":  None,
            "ticket_id": ticket_id,
        }, status=404)

    if ticket.is_used:
        return render(request, "verify.html", {
            "status":  "ALREADY USED",
            "icon":    "⚠️",
            "color":   "#f9c784",
            "heading": "Ticket Already Scanned",
            "detail":  f"This ticket was used on {ticket.used_at.strftime('%d %b %Y at %I:%M %p') if ticket.used_at else 'an earlier scan'}. Entry denied.",
            "ticket":  ticket,
            "ticket_id": ticket_id,
        })

    # ── First valid scan → mark as used ──────────────────────
    ticket.is_used = True
    ticket.used_at = timezone.now()
    ticket.save(update_fields=["is_used", "used_at"])

    return render(request, "verify.html", {
        "status":  "VALID ✓",
        "icon":    "✅",
        "color":   "#40c098",
        "heading": "Entry Approved!",
        "detail":  f"Welcome, {ticket.name}! Enjoy {ticket.event_title}.",
        "ticket":  ticket,
        "ticket_id": ticket_id,
    })


# ════════════════════════════════════════════════════════════
#  HELPER — Send confirmation email
#
#  Uses Django's email backend (configure in settings.py).
#  Embeds a base64 QR image directly in the HTML email body
#  so no external URL is needed.
# ════════════════════════════════════════════════════════════
def _send_confirmation_email(ticket):
    """
    Generates a QR data-URI and sends an HTML confirmation email.
    Called internally by generate_ticket(). Errors are caught so
    a mail failure never breaks the ticket-generation response.
    """
    try:
        # Build the verify URL for the QR
        verify_url = f"http://127.0.0.1:8000/verify/{ticket.ticket_id}/"

        # Generate QR as base64 PNG for embedding in email
        qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=8, border=3)
        qr.add_data(verify_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#3a2a3e", back_color="white")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        qr_b64 = base64.b64encode(buf.getvalue()).decode()
        subject = f"Your Ticket for {ticket.event_title} — {ticket.ticket_id}"

        # Plain-text fallback
        text_body = (
            f"Hi {ticket.name},\n\n"
            f"Your ticket for {ticket.event_title} is confirmed!\n\n"
            f"Event  : {ticket.event_title}\n"
            f"Date   : {ticket.event_date}\n"
            f"Time   : {ticket.event_time}\n"
            f"Venue  : {ticket.event_location}\n"
            f"Ticket : {ticket.ticket_id}\n"
            f"Type   : {ticket.ticket_type}\n\n"
            f"Verify URL: {verify_url}\n\n"
            f"See you there!\n— Eventra Team"
        )

        # HTML email body
        html_body = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    body   {{ margin:0; padding:0; font-family:'Helvetica Neue',Arial,sans-serif; background:#f7f0ff; }}
    .wrap  {{ max-width:560px; margin:40px auto; background:#fff; border-radius:20px; overflow:hidden;
              box-shadow:0 8px 40px rgba(160,80,180,.15); }}
    .hdr   {{ background:linear-gradient(135deg,#e07090,#a070d0,#50b8d8); padding:32px 36px; text-align:center; }}
    .hdr h1{{ margin:0; font-size:28px; color:#fff; letter-spacing:-0.5px; }}
    .hdr p {{ margin:6px 0 0; color:rgba(255,255,255,.8); font-size:14px; }}
    .body  {{ padding:32px 36px; }}
    .greet {{ font-size:18px; font-weight:700; color:#3a2a3e; margin-bottom:6px; }}
    .sub   {{ font-size:14px; color:#7a6080; margin-bottom:28px; line-height:1.6; }}
    .box   {{ border:2px dashed rgba(160,112,208,.3); border-radius:16px; padding:24px; margin-bottom:24px; }}
    .box h2{{ margin:0 0 16px; font-size:20px; color:#3a2a3e; }}
    .row   {{ display:flex; justify-content:space-between; padding:8px 0;
              border-bottom:1px solid #f0e8f8; font-size:13px; }}
    .row:last-child {{ border-bottom:none; }}
    .lbl   {{ color:#b8a8c0; font-weight:600; text-transform:uppercase; font-size:11px; letter-spacing:.04em; }}
    .val   {{ color:#3a2a3e; font-weight:600; text-align:right; max-width:60%; }}
    .tid   {{ font-family:monospace; color:#a070d0; font-size:15px; }}
    .qr    {{ text-align:center; margin:24px 0; }}
    .qr p  {{ font-size:12px; color:#b8a8c0; margin-top:10px; }}
    .qr img{{ border-radius:12px; border:3px solid rgba(160,112,208,.2); }}
    .foot  {{ background:#fdf8ff; padding:20px 36px; text-align:center;
              font-size:12px; color:#b8a8c0; border-top:1px solid #f0e8f8; }}
    .foot a{{ color:#a070d0; text-decoration:none; }}
  </style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <h1>Eventra 🎟</h1>
    <p>Your ticket is confirmed!</p>
  </div>
  <div class="body">
    <div class="greet">Hey {ticket.name}! 👋</div>
    <div class="sub">
      Your registration for <strong>{ticket.event_title}</strong> is confirmed.
      Show the QR code below at the venue entrance for entry.
    </div>
    <div class="box">
      <h2>{ticket.event_title}</h2>
      <div class="row"><span class="lbl">Attendee</span>   <span class="val">{ticket.name}</span></div>
      <div class="row"><span class="lbl">Email</span>      <span class="val">{ticket.email}</span></div>
      <div class="row"><span class="lbl">Date</span>       <span class="val">{ticket.event_date}</span></div>
      <div class="row"><span class="lbl">Time</span>       <span class="val">{ticket.event_time}</span></div>
      <div class="row"><span class="lbl">Location</span>   <span class="val">{ticket.event_location}</span></div>
      <div class="row"><span class="lbl">Organiser</span>  <span class="val">{ticket.organiser}</span></div>
      <div class="row"><span class="lbl">Ticket Type</span><span class="val">{ticket.ticket_type}</span></div>
      <div class="row"><span class="lbl">Ticket ID</span>  <span class="val tid">{ticket.ticket_id}</span></div>
    </div>
    <div class="qr">
      <img src="cid:qr_code" width="180" height="180"alt="QR Code"/>
      <p>Scan this QR code at the venue entrance</p>
    </div>
  </div>
  <div class="foot">
    Questions? <a href="mailto:support@eventra.in">support@eventra.in</a><br/>
    © 2026 Eventra · All rights reserved.
  </div>
</div>
</body>
</html>"""

        msg = EmailMultiAlternatives(
            subject  = subject,
            body     = text_body,
            from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@eventra.in"),
            to       = [ticket.email],
        )
        msg.attach_alternative(html_body, "text/html")
        qr_image = MIMEImage(buf.getvalue())
        qr_image.add_header('Content-ID', '<qr_code>')
        qr_image.add_header('Content-Disposition', 'inline', filename="qr.png")

        msg.attach(qr_image)
        msg.send(fail_silently=False)

    except Exception as exc:
        # Log the error but don't crash the ticket-generation response
        import logging
        logging.getLogger(__name__).warning(f"Email send failed for {ticket.ticket_id}: {exc}")
        # ── NEW IMPORTS (add at top of views.py) ──────────────────────────────────────