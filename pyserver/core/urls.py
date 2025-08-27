"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from core.ai import ask_ai


def health(_request):
    return JsonResponse({"status": "ok", "service": "django"})


def root(_request):
    return JsonResponse({
        "service": "django",
        "message": "Welcome to the Django backend",
        "endpoints": [
            "/admin/",
            "/api/py/health",
            "/api/py/accounts/register",
            "/api/py/accounts/login",
            "/api/py/accounts/me",
        ],
    })

urlpatterns = [
    path('', root),
    path('admin/', admin.site.urls),
    path('api/py/health', health),
    path('api/py/accounts/', include('accounts.urls')),
    path('api/py/ai/ask', ask_ai),
]
