from django.contrib import admin
from .models import Profile, PasswordResetToken, PasswordResetRequest, MolassesReading
from .models import ActivityLog
admin.site.register(ActivityLog)

# ==================================================
# PROFILE
# ==================================================
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "fullname", "uid", "profilePic")
    search_fields = ("fullname", "user__username", "uid")
    list_filter = ("user__is_active",)


# ==================================================
# PASSWORD RESET TOKEN
# ==================================================
@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "token", "created_at", "is_used")
    search_fields = ("user__email", "token")
    list_filter = ("is_used", "created_at")
    readonly_fields = ("created_at",)


# ==================================================
# PASSWORD RESET REQUEST
# ==================================================
@admin.register(PasswordResetRequest)
class PasswordResetRequestAdmin(admin.ModelAdmin):
    list_display = ("email", "token", "created_at", "is_used")
    search_fields = ("email",)
    list_filter = ("is_used", "created_at")
    readonly_fields = ("created_at",)


# ==================================================
# MOLASSES READING
# ==================================================
@admin.register(MolassesReading)
class MolassesReadingAdmin(admin.ModelAdmin):
    list_display = ("id", "timestamp", "source", "brix", "pol", "purity", "volume")
    search_fields = ("source", "notes")
    list_filter = ("source", "timestamp")
    readonly_fields = ("id", "timestamp")
