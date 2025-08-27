# Django on Render

This folder contains a Django app ready for Render.

Key files:
- requirements.txt: Python dependencies.
- Procfile: Starts Gunicorn on Render.
- core/settings.py: Production-friendly settings with env vars and WhiteNoise.

Build (Render):
- pip install -r requirements.txt
- python manage.py collectstatic --noinput
- python manage.py migrate --noinput

Start (Render):
- gunicorn core.wsgi:application --bind 0.0.0.0:$PORT

Important env vars:
- DJANGO_SECRET_KEY (required in prod)
- DJANGO_DEBUG=False
- DJANGO_ALLOWED_HOSTS (comma-separated)
- DJANGO_CORS / DJANGO_CSRF (comma-separated frontend origins)
- DATABASE_URL (optional Postgres)
- REDIS_URL (optional)
