"""
ASGI config for ethanol project.

It exposes the ASGI callable as a module-level variable named ``application``.
This config sets up channels ProtocolTypeRouter to handle:
  - Standard HTTP connections via standard WSGI application get_asgi_application().
  - Real-time WebSockets via channels AuthMiddlewareStack and websocket_urlpatterns.
"""

import os
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from ethanolapp.routing import websocket_urlpatterns

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ethanol.settings")

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})