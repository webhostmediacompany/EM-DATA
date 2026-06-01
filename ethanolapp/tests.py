from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from ethanolapp.models import Profile, MolassesReading, ActivityLog
import json

class EthanolAppBackendTests(TestCase):
    def setUp(self):
        self.client = Client()
        # Create standard user and associated Profile
        self.user = User.objects.create_user(
            username="test@example.com",
            email="test@example.com",
            password="testpassword",
            first_name="Test User"
        )
        self.profile = Profile.objects.create(
            user=self.user,
            fullname="Test User"
        )
        
        # Create a sample molasses reading
        self.reading = MolassesReading.objects.create(
            source="molasses",
            brix=80.0,
            pol=60.0,
            purity=75.0,
            volume=5000.0,
            notes="Initial molasses reading"
        )

    def test_readings_summary_api(self):
        """Test the GET /api/readings/summary/ aggregate endpoint."""
        url = reverse("readings-summary")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertTrue(data["success"])
        self.assertEqual(data["total_readings"], 1)
        self.assertEqual(data["volumes"]["molasses"], 5000.0)
        self.assertEqual(data["averages"]["brix"], 80.0)

    def test_seed_readings_api(self):
        """Test the POST /api/readings/seed/ data generation endpoint."""
        url = reverse("readings-seed")
        # Assert database counts before seed
        self.assertEqual(MolassesReading.objects.count(), 1)
        
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertTrue(data["success"])
        self.assertEqual(data["count"], 30)
        
        # Verify database has successfully seeded 30 readings + 1 initial
        self.assertEqual(MolassesReading.objects.count(), 31)

    def test_add_activity_log_with_string_uid(self):
        """Test the activity log endpoint with a string Profile uid (e.g. USR-XXXXXX)."""
        url = reverse("add-activity-log")
        payload = {
            "user_id": self.profile.uid,  # String Profile UID
            "action": "click",
            "module": "dashboard",
            "message": "User toggled theme preference",
            "level": "info"
        }
        
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        
        # Confirm activity log was safely saved in the database
        log = ActivityLog.objects.filter(action="click").first()
        self.assertIsNotNone(log)
        # Assert the dynamic lookup correctly mapped the Profile string UID to the integer User object
        self.assertEqual(log.user, self.user)

