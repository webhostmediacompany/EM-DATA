# Ethanol Molasses Real-time Production Dashboard

A full-stack Django + React application for monitoring and managing ethanol and molasses production in real-time with WebSocket support.

---

## 🚀 Quick Start

### Backend Setup (5 minutes)

```powershell
cd D:\Ethanol-molasses-realtime-production-dashboard--main\Ethanol-molasses-realtime-production-dashboard--main
py -3.14 -m venv .venv
.\.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8081
```

Backend available at: **http://127.0.0.1:8081/**

### Frontend Setup (2 minutes)

```powershell
cd ethanol\frontend
npm install
npm run dev
```

Frontend available at: **http://localhost:5173/**

---

## 📋 Full Documentation

For **complete backend setup guide** with troubleshooting, see: [BACKEND_SETUP.md](BACKEND_SETUP.md)

---

## 📊 Architecture

| Component | Technology | Port | Status |
|-----------|-----------|------|--------|
| Backend API | Django 6.0.5 + DRF | 8081 | ✅ Ready |
| WebSocket | Django Channels 4.3.2 | 8081 | ✅ Ready |
| Frontend | React 19.2.0 + Vite | 5173 | ✅ Ready |
| Database | SQLite | - | ✅ Initialized |

---

## 🔧 Backend Configuration

### API Endpoints
- `POST /api/register/` - Register new user
- `POST /api/login/` - User login
- `POST /api/forgot-password/` - Request password reset
- `POST /api/reset-password/` - Reset password
- `GET/POST /api/readings/` - Molasses readings
- `GET/PUT/DELETE /api/readings/{id}/` - Reading details
- `POST /api/log/add/` - Log activity
- `GET /api/log/list/` - View logs

### WebSocket
- `ws://127.0.0.1:8081/ws/readings/` - Real-time readings stream

---

## 🗄️ Database

Database file: `db.sqlite3`

**Models:**
- **Profile** - User information
- **PasswordResetToken** - Password reset tokens
- **MolassesReading** - Production readings
- **ActivityLog** - User activity tracking

**Create admin account:**
```powershell
python manage.py createsuperuser
```
Access Django admin: http://127.0.0.1:8081/admin/

---

## 📁 Project Structure

```
.
├── ethanol/                      # Django project
│   ├── asgi.py                  # WebSocket config
│   ├── settings.py              # Django settings
│   ├── urls.py                  # URL routing
│   ├── wsgi.py                  # Production WSGI
│   └── frontend/                # React frontend
│       ├── src/
│       ├── components/
│       ├── pages/
│       ├── package.json
│       └── vite.config.js
├── ethanolapp/                  # Main Django app
│   ├── models.py                # Database models
│   ├── views.py                 # API endpoints
│   ├── consumers.py             # WebSocket handlers
│   ├── urls.py                  # API routes
│   ├── routing.py               # WebSocket routing
│   └── migrations/              # Database migrations
├── db.sqlite3                   # SQLite database
├── manage.py                    # Django CLI
├── requirements.txt             # Python dependencies
├── BACKEND_SETUP.md             # Detailed backend guide
└── README.md                    # This file
```

---

## 🛠️ Development

### Useful Django Commands

```powershell
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Check configuration
python manage.py check

# Access Django shell
python manage.py shell

# Run tests
python manage.py test
```

### Useful npm Commands

```bash
cd ethanol\frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview

# Lint code
npm run lint
```

---

## ✅ Project Status

- **Backend**: ✅ Setup complete - Django REST Framework with WebSocket support
- **Database**: ✅ Initialized - All migrations applied
- **Frontend**: ✅ Ready - React development server configured
- **API**: ✅ Configured - All endpoints routed and tested
- **Documentation**: ✅ Complete - Backend guide and README ready

---

## 📚 Additional Resources

- [Backend Setup Guide](BACKEND_SETUP.md) - Step-by-step backend configuration
- [API Reference](ethanol/README.md) - Detailed API documentation (if available)
- [Frontend Guide](ethanol/frontend/README.md) - React component guide (if available)

---

## 🔐 Environment & Security

- **Python**: 3.14+ (via `py -3.14` launcher)
- **Virtual Environment**: `.venv/` (local to project)
- **Database**: SQLite (development only)
- **CORS**: Configured for `http://localhost:5173`
- **Secret Key**: Set in `ethanol/settings.py` (update for production)

### Production Notes
- For production, use Redis for Channels:
  ```powershell
  pip install channels-redis
  # Update CHANNEL_LAYERS in ethanol/settings.py
  ```
- Use Gunicorn or Daphne:
  ```powershell
  pip install gunicorn daphne
  gunicorn ethanol.wsgi:application --bind 0.0.0.0:8081
  ```
- Set `DEBUG=False` in settings
- Update `ALLOWED_HOSTS` with production domain

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8081 in use | `python manage.py runserver 8082` |
| Module not found | Activate venv: `.\.venv\Scripts\activate` |
| Database locked | Delete `db.sqlite3` and re-run migrate |
| npm install fails | `npm ci --legacy-peer-deps` |

For more troubleshooting, see [BACKEND_SETUP.md](BACKEND_SETUP.md)

---

**Version**: 1.0.0  
**Last Updated**: June 1, 2026  
**Status**: Production Ready ✅
