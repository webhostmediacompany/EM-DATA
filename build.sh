#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "====== STARTING PRODUCTION BUILD PROCESS ======"

# Install dependencies
echo "--> Installing Python dependencies..."
pip install -r requirements.txt

# Apply migrations
echo "--> Applying database migrations..."
python manage.py migrate --noinput

# Gather static files
echo "--> Gathering static files via collectstatic..."
python manage.py collectstatic --no-input

echo "====== BUILD PROCESS COMPLETED SUCCESSFULY ======"
