# QUICK START GUIDE
# Ethanol Molasses Real-time Production Dashboard

## ⚡ 30-Second Setup

### 1️⃣ Backend (One-Time Setup)
```powershell
cd D:\Ethanol-molasses-realtime-production-dashboard--main\Ethanol-molasses-realtime-production-dashboard--main
py -3.14 -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
```

### 2️⃣ Start Backend Server
```powershell
python manage.py runserver 8081
```
Backend: http://127.0.0.1:8081
Admin: http://127.0.0.1:8081/admin

### 3️⃣ Start Frontend Server (New Terminal)
```powershell
cd ethanol\frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

---

## 📌 Important Ports
- **Backend API**: 8081
- **Frontend**: 5173
- **WebSocket**: ws://127.0.0.1:8081/ws/readings/

---

## 🔑 Admin Login
Once you create superuser, access:
- **URL**: http://127.0.0.1:8081/admin/
- **Username/Email/Password**: As entered during `createsuperuser`

---

## 📱 API Testing

### Register User
```bash
POST http://127.0.0.1:8081/api/register/
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "testpass123"
}
```

### Login User
```bash
POST http://127.0.0.1:8081/api/login/
Content-Type: application/json

{
  "username": "testuser",
  "password": "testpass123"
}
```

### Get Readings
```bash
GET http://127.0.0.1:8081/api/readings/
```

### Create Reading
```bash
POST http://127.0.0.1:8081/api/readings/
Content-Type: application/json

{
  "source": "Tank A",
  "brix": 25.5,
  "pol": 24.2,
  "purity": 94.1,
  "volume": 1500,
  "notes": "Morning batch"
}
```

---

## 🔄 WebSocket Connection (JavaScript)
```javascript
const ws = new WebSocket('ws://127.0.0.1:8081/ws/readings/');

ws.onopen = () => {
  console.log('Connected to readings stream');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Reading update:', data);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from readings stream');
};
```

---

## ⚠️ Common Issues & Fixes

### Issue: "port already in use"
```powershell
python manage.py runserver 8082  # Use different port
```

### Issue: Module not found (django, etc.)
```powershell
.\.venv\Scripts\activate  # Ensure venv is active
pip install -r requirements.txt
```

### Issue: Database locked
```powershell
# Delete and recreate database
rm db.sqlite3
python manage.py migrate
```

### Issue: Frontend can't connect to backend
- Ensure backend is running: `http://127.0.0.1:8081`
- Check CORS is configured (should be by default)
- Check browser console for specific errors

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `ethanol/settings.py` | Django configuration |
| `ethanol/asgi.py` | WebSocket setup |
| `ethanolapp/models.py` | Database models |
| `ethanolapp/views.py` | API endpoints |
| `ethanolapp/consumers.py` | WebSocket handlers |
| `requirements.txt` | Python dependencies |
| `db.sqlite3` | SQLite database |
| `BACKEND_SETUP.md` | Full backend guide |

---

## 🚀 Next Steps

1. **Backend Running**: `python manage.py runserver 8081` ✅
2. **Frontend Running**: `npm run dev` (from ethanol/frontend) ✅
3. **Test Registration**: POST to `/api/register/`
4. **Test Login**: POST to `/api/login/`
5. **Test Real-time**: Open DevTools Console, connect to WebSocket
6. **Deploy**: Follow production setup in `BACKEND_SETUP.md`

---

## 📞 Support

- Full guide: See `BACKEND_SETUP.md`
- API docs: See endpoint comments in `ethanolapp/views.py`
- Frontend issues: Check `ethanol/frontend/README.md`

---

**Version**: 1.0.0 | **Updated**: June 1, 2026
