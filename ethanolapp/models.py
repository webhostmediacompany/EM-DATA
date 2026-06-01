from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid

# class ActivityLog(models.Model):
# -------------------------------
# Profile
# -------------------------------
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    fullname = models.CharField(max_length=255)
    uid = models.CharField(max_length=20, blank=True, null=True)
    profilePic = models.ImageField(upload_to="profiles/", null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.uid:
            while True:
                new_uid = f"USR-{uuid.uuid4().hex[:8].upper()}"
                if not Profile.objects.filter(uid=new_uid).exists():
                    self.uid = new_uid
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return self.fullname


# -------------------------------
# Password Reset Token
# -------------------------------
class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.email} - {self.token}"


# -------------------------------
# Password Reset Request
# -------------------------------
class PasswordResetRequest(models.Model):
    email = models.EmailField()
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return self.email

# -------------------------------
# Molasses Reading
# -------------------------------
class MolassesReading(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    source = models.CharField(max_length=50, default='molasses')
    brix = models.FloatField(null=True, blank=True)
    pol = models.FloatField(null=True, blank=True)
    purity = models.FloatField(null=True, blank=True)
    volume = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.source} @ {self.timestamp.isoformat()}"


# -------------------------------
# Activity Log
# -------------------------------
class ActivityLog(models.Model):
    LEVELS = (
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=100, default="view")
    module = models.CharField(max_length=100, default="system")
    message = models.TextField()
    level = models.CharField(max_length=20, choices=LEVELS, default='info')
    created_at = models.DateTimeField(auto_now_add=True)

    second = models.IntegerField(default=0, editable=False)
    minute = models.IntegerField(default=0, editable=False)
    hour = models.IntegerField(default=0, editable=False)
    day = models.IntegerField(default=1, editable=False)
    week = models.IntegerField(default=1, editable=False)
    month = models.IntegerField(default=1, editable=False)
    year = models.IntegerField(default=timezone.now().year, editable=False)

    def save(self, *args, **kwargs):
        now = timezone.now()
        self.second = now.second
        self.minute = now.minute
        self.hour = now.hour
        self.day = now.day
        self.week = now.isocalendar()[1]
        self.month = now.month
        self.year = now.year
        super().save(*args, **kwargs)

    def __str__(self):
        user_str = self.user.username if self.user else "Anonymous"
        return f"{self.action} - {self.module} - {user_str} - {self.level}"
