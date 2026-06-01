# Backend Setup Guide - Ethanol Molasses Real-time Production Dashboard

## Overview

This is a Django REST Framework backend with WebSocket support using Django Channels. The backend provides APIs for user authentication, real-time molasses reading data, and activity logging.

---

## Prerequisites

- **Python**: 3.14+ (already available on your system)
- **pip**: Latest version
- **Git** (optional, for cloning)

---

## Complete Backend Setup Instructions

### Step 1: Navigate to Project Directory

```powershell
cd D:\Ethanol-molasses-realtime-production-dashboard--main\Ethanol-molasses-realtime-production-dashboard--main
```

### Step 2: Create Python Virtual Environment

```powershell
py -3.14 -m venv .venv
```

### Step 3: Activate Virtual Environment

```powershell
.\.venv\Scripts\activate
```

Once activated, your terminal prompt should show `(.venv)`.

### Step 4: Upgrade pip, setuptools, and wheel

```powershell
python -m pip install --upgrade pip setuptools wheel
```

### Step 5: Install Backend Dependencies

```powershell
pip install -r requirements.txt
```

This installs:
- Django 6.0.5
- Django REST Framework 3.17.1
- Django Channels 4.3.2 (WebSockets)
- Django CORS Headers 4.9.0
- Pillow 12.2.0 (image processing)
- And all supporting packages

### Step 6: Run Database Migrations

```powershell
python manage.py makemigrations
python manage.py migrate
```

This creates the SQLite database (`db.sqlite3`) with all tables:
- User authentication tables
- Profile data
- Password reset tokens
- Molasses readings
- Activity logs

### Step 7: Create Admin Superuser (Optional)

```powershell
python manage.py createsuperuser
```

Follow the prompts to create an admin account:
- **Username**: Choose any username (e.g., `admin`)
- **Email**: Enter your email (e.g., `admin@example.com`)
- **Password**: Enter and confirm a password

Once created, you can access Django admin at: `http://127.0.0.1:8081/admin/`

### Step 8: Verify Setup

```powershell
python manage.py check
```

Expected output:
```
System check identified no issues (0 silenced).
```

### Step 9: Start the Backend Server

```powershell
python manage.py runserver 8081
```

Expected output:
```
Django version 6.0.5, using settings 'ethanol.settings'
Starting development server at http://127.0.0.1:8081/
```

---

## Backend API Endpoints

### Authentication

- **Register**: `POST /api/register/`
- **Login**: `POST /api/login/`
- **Forgot Password**: `POST /api/forgot-password/`
- **Reset Password**: `POST /api/reset-password/`

### Molasses Readings

- **List/Create**: `GET/POST /api/readings/`
- **Detail**: `GET/PUT/PATCH/DELETE /api/readings/{id}/`

### Activity Logs

- **Add Log**: `POST /api/log/add/`
- **List Logs**: `GET /api/log/list/`

### WebSocket

- **Reading Stream**: `ws://127.0.0.1:8081/ws/readings/`

---

## Project Structure

```
ethanol/                          # Main Django project
├── __init__.py
├── asgi.py                       # ASGI configuration (WebSockets)
├── settings.py                   # Django settings
├── urls.py                       # URL routing
├── wsgi.py                       # WSGI for production
└── static/                       # Static files

ethanolapp/                       # Main Django app
├── admin.py                      # Admin interface
├── apps.py                       # App config
├── consumers.py                  # WebSocket consumers
├── middleware.py                 # Custom middleware
├── models.py                     # Database models
├── routing.py                    # WebSocket routing
├── serializers.py                # DRF serializers
├── urls.py                       # API URLs
├── views.py                      # API views
├── migrations/                   # Database migrations
└── tests.py                      # Tests

db.sqlite3                        # SQLite database (created after migration)
manage.py                         # Django management script
requirements.txt                  # Python dependencies
```

---

## Database Models

### User (Django Built-in)
- Username, email, password, first name

### Profile
- User (1-to-1 relation)
- Full name
- UID (auto-generated)
- Profile picture (optional)

### Molasses Reading
- ID (UUID)
- Timestamp
- Source
- Brix value
- Pol value
- Purity value
- Volume
- Notes

### Activity Log
- ID (UUID)
- User (optional)
- Action
- Module
- Message
- Level (info/warning/error)
- Created at
- Time breakdown (second, minute, hour, day, week, month, year)

---

## Environment Variables (Optional)

Create a `.env` file if you need custom settings:

```
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

Currently, the project uses `ethanol/settings.py` with hardcoded values suitable for development.

---

## Django Admin Interface

1. Start the backend: `python manage.py runserver 8081`
2. Navigate to: `http://127.0.0.1:8081/admin/`
3. Login with superuser credentials (created in Step 7)
4. Manage users, profiles, readings, and logs

---

## Running the Backend in Production

For production deployment, use:

```powershell
gunicorn ethanol.wsgi:application --bind 0.0.0.0:8081
```

Or with Daphne (for WebSocket support):

```powershell
daphne -b 0.0.0.0 -p 8081 ethanol.asgi:application
```

Note: You'll need to install `gunicorn` or `daphne`:
```powershell
pip install gunicorn daphne
```

---

## Troubleshooting

### Issue: "No module named 'django'"

**Solution**: Make sure the virtual environment is activated and dependencies are installed.
```powershell
.\.venv\Scripts\activate
pip install -r requirements.txt
```

### Issue: "Port 8081 is already in use"

**Solution**: Use a different port or kill the process using port 8081.
```powershell
python manage.py runserver 8082
```

### Issue: Database locked errors

**Solution**: Delete `db.sqlite3` and re-run migrations.
```powershell
rm db.sqlite3
python manage.py migrate
```

### Issue: Static files not found

**Solution**: Collect static files (for production only).
```powershell
python manage.py collectstatic --noinput
```

---

## Useful Commands

```powershell
# Create new migrations (after model changes)
python manage.py makemigrations

# Apply pending migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Check project configuration
python manage.py check

# Load initial data
python manage.py loaddata fixture_name

# Access Django shell
python manage.py shell

# Run tests
python manage.py test

# Collect static files (production)
python manage.py collectstatic
```

---

## Connecting Frontend

The frontend connects to the backend using:

- **Base API URL**: `http://127.0.0.1:8081/api/`
- **WebSocket URL**: `ws://127.0.0.1:8081/ws/readings/`

Both frontend and backend must be running for full functionality.

---

## Support for Redis and Production Channels

To use Redis for WebSocket support in production:

1. Install Redis on your system or use a service
2. Update `ethanol/settings.py`:

```python
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],
        },
    },
}
```

3. Install `channels-redis`:

```powershell
pip install channels-redis
```

4. Restart the backend to use Redis

---

## Key Configuration Files

- **`ethanol/settings.py`**: Main Django settings
  - INSTALLED_APPS
  - MIDDLEWARE
  - DATABASES
  - TEMPLATES
  - STATIC_FILES
  - CHANNEL_LAYERS

- **`ethanol/urls.py`**: Main URL router
- **`ethanolapp/urls.py`**: API endpoints
- **`ethanolapp/models.py`**: Database models
- **`ethanolapp/views.py`**: API logic
- **`ethanolapp/consumers.py`**: WebSocket handlers
- **`ethanolapp/routing.py`**: WebSocket routing

---

## Next Steps

1. ✅ Backend setup complete
2. Setup and run the frontend: See `FRONTEND_SETUP.md` or README.md
3. Test API endpoints using Postman or curl
4. Implement custom authentication if needed
5. Configure email for password reset (if desired)

---

**Created**: June 1, 2026  
**Python**: 3.14+  
**Django**: 6.0.5  
