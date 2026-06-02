from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.conf import settings
from django.utils import timezone
import json
import random
from datetime import timedelta

# Models
from .models import Profile, PasswordResetToken, MolassesReading, ActivityLog

# DRF
from rest_framework import viewsets, filters, generics
from .serializers import MolassesReadingSerializer

# WebSockets
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync



# ======================================================================
# WEB PAGE
# ======================================================================

def index(request):
    return render(request, "index.html")


# ======================================================================
# AUTH
# ======================================================================

@csrf_exempt
def register_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    try:
        data = json.loads(request.body)
        fullname = data.get("fullname")
        email = data.get("email")
        password = data.get("password")

        if not fullname or not email or not password:
            return JsonResponse({"error": "All fields required"}, status=400)

        if User.objects.filter(username=email).exists():
            return JsonResponse({"error": "Email already registered"}, status=400)

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=fullname
        )

        Profile.objects.create(user=user, fullname=fullname)

        ActivityLog.objects.create(
            user=user,
            action="register",
            module="auth",
            message="User registered successfully",
            level="info"
        )

        return JsonResponse({"success": True, "message": "User registered"})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    try:
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        user = authenticate(username=email, password=password)
        if not user:
            return JsonResponse({"error": "Invalid credentials"}, status=401)

        profile = Profile.objects.get(user=user)

        ActivityLog.objects.create(
            user=user,
            action="login",
            module="auth",
            message="User logged in",
            level="info"
        )

        return JsonResponse({
            "success": True,
            "uid": profile.uid,
            "fullname": profile.fullname,
            "email": user.email,
            "profilePic": request.build_absolute_uri(profile.profilePic.url)
            if profile.profilePic else None
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ======================================================================
# PASSWORD RESET
# ======================================================================

def send_reset_email(user_email, request=None):
    try:
        user = User.objects.get(email=user_email)
        token = get_random_string(50)

        PasswordResetToken.objects.create(user=user, token=token)

        base_url = "http://localhost:8081"
        if request:
            base_url = request.build_absolute_uri('/')[:-1]
        reset_link = f"{base_url}/reset-password?token={token}&uid={user.id}"

        send_mail(
            subject="Password Reset",
            message=f"Click the link to reset your password:\n\n{reset_link}",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user_email],
            fail_silently=False,
        )
        return True

    except User.DoesNotExist:
        return False


@csrf_exempt
def forgot_password(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    try:
        data = json.loads(request.body)
        email = data.get("email")

        if not email:
            return JsonResponse({"error": "Email required"}, status=400)

        user = User.objects.filter(email=email).first()
        if not user:
            return JsonResponse({"error": "User not found"}, status=404)

        token = get_random_string(40)
        PasswordResetToken.objects.create(user=user, token=token)

        reset_url = f"/reset-password?token={token}&uid={user.id}"

        ActivityLog.objects.create(
            user=user,
            action="request_password_reset",
            module="auth",
            message="Password reset requested",
            level="warning"
        )

        return JsonResponse({
            "message": "Redirecting to reset page",
            "reset_url": reset_url
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def reset_password(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    try:
        data = json.loads(request.body)
        uid = data.get("uid")
        token = data.get("token")
        password = data.get("password")

        if not uid or not token or not password:
            return JsonResponse({"error": "Missing fields"}, status=400)

        reset = PasswordResetToken.objects.filter(
            user_id=uid,
            token=token,
            is_used=False
        ).first()

        if not reset:
            return JsonResponse({"error": "Invalid or expired token"}, status=400)

        user = User.objects.get(id=uid)
        user.set_password(password)
        user.save()

        reset.is_used = True
        reset.save()

        ActivityLog.objects.create(
            user=user,
            action="reset_password",
            module="auth",
            message="Password reset successful",
            level="info"
        )

        return JsonResponse({"message": "Password reset successful"})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

  # ======================================================================
# MOLASSES API (REST + REALTIME)
# ======================================================================

class ReadingListCreateAPI(generics.ListCreateAPIView):
    queryset = MolassesReading.objects.all()
    serializer_class = MolassesReadingSerializer


class ReadingRetrieveUpdateDeleteAPI(generics.RetrieveUpdateDestroyAPIView):
    queryset = MolassesReading.objects.all()
    serializer_class = MolassesReadingSerializer


class MolassesReadingViewSet(viewsets.ModelViewSet):
    queryset = MolassesReading.objects.all().order_by("-timestamp")
    serializer_class = MolassesReadingSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["source", "notes"]

    def perform_create(self, serializer):
        instance = serializer.save()
        self._broadcast("created", instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        self._broadcast("updated", instance)

    def perform_destroy(self, instance):
        data = MolassesReadingSerializer(instance).data
        instance.delete()
        self._broadcast("deleted", data_dict=data)

    def _broadcast(self, event, instance=None, data_dict=None):
        data = data_dict if data_dict else MolassesReadingSerializer(instance).data
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "readings",
            {
                "type": f"reading.{event}",
                "event": event,
                "data": data,
            }
        )
      


# ======================================================================
# ACTIVITY LOG API
# ======================================================================

@csrf_exempt
def add_activity_log(request):
    if request.method != 'POST':
        return JsonResponse({"success": False, "error": "POST required"}, status=400)

    try:
        data = json.loads(request.body)
        user_uid = data.get("user_id")
        user = None
        
        if user_uid:
            # Check if it is a Profile uid (e.g. USR-XXXXXX)
            profile = Profile.objects.filter(uid=user_uid).first()
            if profile:
                user = profile.user
            else:
                # Fallback to direct User ID if it is an integer
                if str(user_uid).isdigit():
                    user = User.objects.filter(id=int(user_uid)).first()

        ActivityLog.objects.create(
            user=user,
            action=data.get("action", "view"),
            module=data.get("module", "system"),
            message=data.get("message", ""),
            level=data.get("level", "info"),
        )
        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@csrf_exempt
def get_activity_logs(request):
    logs = ActivityLog.objects.all().order_by('-created_at')[:200]

    data = [{
        "id": str(log.id),
        "user": log.user.username if log.user else "System",
        "action": log.action,
        "module": log.module,
        "message": log.message,
        "level": log.level,
        "created_at": log.created_at.strftime("%d %b %Y, %I:%M:%S %p")
    } for log in logs]

    return JsonResponse(data, safe=False)


# ======================================================================
# ANALYTICS & SIMULATION APIs (ADVANCED RELATED BACKEND FEATURES)
# ======================================================================

@csrf_exempt
def get_readings_summary(request):
    """
    GET API to return production statistics, volumes, averages, and active alert counts.
    Perfect for rich dashboard display metrics.
    """
    if request.method != "GET":
        return JsonResponse({"error": "GET required"}, status=400)

    try:
        readings = MolassesReading.objects.all()
        count = readings.count()

        # Calculate volumes by product source
        ethanol_volume = sum(r.volume for r in readings if r.source == 'ethanol' and r.volume)
        molasses_volume = sum(r.volume for r in readings if r.source == 'molasses' and r.volume)

        # Extract values for safe average computations
        brix_vals = [r.brix for r in readings if r.brix is not None]
        pol_vals = [r.pol for r in readings if r.pol is not None]
        purity_vals = [r.purity for r in readings if r.purity is not None]

        avg_brix = sum(brix_vals) / len(brix_vals) if brix_vals else 0
        avg_pol = sum(pol_vals) / len(pol_vals) if pol_vals else 0
        avg_purity = sum(purity_vals) / len(purity_vals) if purity_vals else 0

        # Out-of-bounds warning threshold counts (e.g. low purity or high brix concentration)
        brix_alerts = sum(1 for v in brix_vals if v < 70.0 or v > 90.0)
        purity_alerts = sum(1 for v in purity_vals if v < 75.0)
        pol_alerts = sum(1 for v in pol_vals if v < 50.0)
        total_alerts = brix_alerts + purity_alerts + pol_alerts

        # Activity log tracking
        ActivityLog.objects.create(
            user=None,
            action="summarize",
            module="reports",
            message=f"Overview summary requested. Checked {count} readings. Found {total_alerts} alert flags.",
            level="info"
        )

        return JsonResponse({
            "success": True,
            "total_readings": count,
            "volumes": {
                "ethanol": round(ethanol_volume, 1),
                "molasses": round(molasses_volume, 1),
                "total": round(ethanol_volume + molasses_volume, 1)
            },
            "averages": {
                "brix": round(avg_brix, 2),
                "pol": round(avg_pol, 2),
                "purity": round(avg_purity, 2)
            },
            "alerts": {
                "brix": brix_alerts,
                "pol": pol_alerts,
                "purity": purity_alerts,
                "total": total_alerts
            }
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def seed_readings(request):
    """
    POST API to simulate and seed the database with 30 realistic past readings.
    Used for instant chart visualization and development demonstration.
    """
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    try:
        sources = ['molasses', 'ethanol']
        now = timezone.now()
        seeded_count = 0

        for i in range(30):
            source = random.choice(sources)
            
            # Generate premium, scientifically aligned, and fully realistic sensor values
            if source == 'molasses':
                brix = round(random.uniform(75.0, 88.0), 1)
                pol = round(random.uniform(50.0, 65.0), 1)
                purity = round((pol / brix) * 100, 1) if brix else 0
                volume = round(random.uniform(2000.0, 8000.0), 1)
            else:  # ethanol production
                brix = round(random.uniform(10.0, 18.0), 1)
                pol = round(random.uniform(5.0, 12.0), 1)
                purity = round((pol / brix) * 100, 1) if brix else 0
                volume = round(random.uniform(5000.0, 15000.0), 1)

            # Distribute dates evenly across the past 7 days
            days_ago = random.randint(0, 7)
            hours_ago = random.randint(0, 23)
            mins_ago = random.randint(0, 59)
            timestamp = now - timedelta(days=days_ago, hours=hours_ago, minutes=mins_ago)

            reading = MolassesReading(
                source=source,
                brix=brix,
                pol=pol,
                purity=purity,
                volume=volume,
                notes=f"Simulated sensor reading #{i + 1} - auto-seeded.",
            )
            reading.save()
            
            # Force apply historic timestamp to bypass auto_now_add limitation
            MolassesReading.objects.filter(id=reading.id).update(timestamp=timestamp)
            seeded_count += 1

        ActivityLog.objects.create(
            user=None,
            action="seed",
            module="data",
            message=f"Bulk seeded 30 historic production sensor entries successfully.",
            level="warning"
        )

        return JsonResponse({
            "success": True,
            "count": seeded_count,
            "message": "Seeded 30 realistic molasses/ethanol production logs successfully!"
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
