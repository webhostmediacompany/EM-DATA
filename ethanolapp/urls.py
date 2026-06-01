from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    index,
    register_user,
    login_user,
    forgot_password,
    reset_password,
    MolassesReadingViewSet,
    ReadingListCreateAPI,
    ReadingRetrieveUpdateDeleteAPI,
    add_activity_log,
    get_activity_logs
)

# -------------------------------
# DRF Router for ViewSets
# -------------------------------
router = DefaultRouter()
router.register(r'readings', MolassesReadingViewSet, basename='readings')

# -------------------------------
# URL Patterns
# -------------------------------
urlpatterns = [
    # -------------------------------
    # Web Pages
    # -------------------------------
    path("", index, name="index"),

    # -------------------------------
    # Auth Pages (Template views)
    # -------------------------------
    path("register/", register_user, name="register"),
    path("login/", login_user, name="login"),
    path("forgot-password/", forgot_password, name="forgot-password"),
    path("reset-password/<str:token>/", reset_password, name="reset-password"),



    # -------------------------------
    # Analytics & Simulation APIs
    # -------------------------------
    path("readings/summary/", views.get_readings_summary, name="readings-summary"),
    path("readings/seed/", views.seed_readings, name="readings-seed"),

    # -------------------------------
    # DRF ViewSet Router URLs
    # -------------------------------
    path("", include(router.urls)),

    # -------------------------------
    # Activity Logs API
    # -------------------------------
    path("log/add/", add_activity_log, name="add-activity-log"),
    path("log/list/", get_activity_logs, name="get-activity-logs"),
]
