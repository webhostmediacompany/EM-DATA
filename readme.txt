username: webhost
password: satish123@#
===================================================================
pip install djangorestframework django-cors-headers
pip install django-cors-headers
pip install djangorestframework
python -m venu venu
venu\Scripts\activate
python.exe -m pip install -upgrade pip

=======optional use for connect between bridge in fronttend and backend===========================
pip install django djnagorestframework
django-cors-headers
pip install Pillow
pip install django djangorestframework channels channels_redis psycopg2-binary
pip install django djangorestframework channels channels_redis asgiref
pip install psycopg2-binary
python manage.py migrate ethanolapp 0004 --fake
pip install channels



==================================================================================================
un123@gmail.com
un
===============================================================
problemetic problem:-
real-time system to monitor production efficiency,
resource utilization,
revenue impact.
///////////////////////////////////////////
pip show django
pip install django
pip3 install django
python -m django --version
.\venv\Scripts\activate
//////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
# ===================================================================
# GO-FLAMINGO ETHANOL & MOLASSES Dashboard - Startup & Operations Guide
# ===================================================================

[SYSTEM CREDENTIALS]
Username: webhost
Password: satish123@#

[DATABASE CREDENTIALS (Superuser)]
Email: un123@gmail.com
Username: un
Password: un

===================================================================
1) QUICKSTART (ONE-CLICK LAUNCH)
===================================================================
We have created a PowerShell automation script that launches BOTH the backend
django server and the frontend React portal in separate terminal windows.

To launch everything in one-click, run this command in your PowerShell terminal:
  powershell .\start-servers.ps1

===================================================================
2) MANUAL BACKEND STARTUP
===================================================================
If you prefer to spin up the Django backend server manually, follow these steps:

# Step A: Navigate to the project root directory
  cd "d:\Ethanol-molasses-realtime-production-dashboard--main\Ethanol-molasses-realtime-production-dashboard--main"

# Step B: Activate the Python Virtual Environment
  .venv\Scripts\activate

# Step C: Install dependencies (if you haven't already done so)
  pip install -r requirements.txt

# Step D: Run database migrations to ensure correct schema
  python manage.py makemigrations
  python manage.py migrate

# Step E: Start the backend server on Port 8081
  python manage.py runserver 8081

===================================================================
3) MANUAL FRONTEND STARTUP
===================================================================
If you prefer to start the React frontend Vite development server manually:

# Step A: Navigate to the frontend directory
  cd "d:\Ethanol-molasses-realtime-production-dashboard--main\Ethanol-molasses-realtime-production-dashboard--main\ethanol\frontend"

# Step B: Install node modules (if you haven't already done so)
  npm install

# Step C: Start the Vite developer server
  npm run dev

# Step D: Access the browser portal at:
  http://localhost:5173/

===================================================================
4) SYSTEM CHECK & TESTS RUN
===================================================================
To verify the environment is correctly configured:
  powershell .\verify-setup.ps1

To execute the backend Django test suite and ensure all features work perfectly:
  .venv\Scripts\python.exe manage.py test

===================================================================
5) ADVANCED DEVELOPMENT APIS
===================================================================
# Seed realistic sensor history logs (POST):
  Invoke-RestMethod -Uri "http://127.0.0.1:8081/api/readings/seed/" -Method Post

# View aggregate summary stats (GET):
  http://127.0.0.1:8081/api/readings/summary/
===================================================================

cd "D:\Ethanol-molasses-realtime-production-dashboard--main\Ethanol-molasses-realtime-production-dashboard--main"
git remote remove origin
git remote add origin <CORRECT-REPO-URL>
git push -u origin main
====================================================================
:: 1. Navigate to the project root directory
cd /d "d:\Ethanol-molasses-realtime-production-dashboard--main\Ethanol-molasses-realtime-production-dashboard--main"

:: 2. Activate the Python virtual environment
call .venv\Scripts\activate

:: 3. Spin up the unified Django server on Port 8081
python manage.py runserver 8081
git push --set-upstream origin main
