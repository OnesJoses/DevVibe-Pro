from django.urls import path
from .views import register, login_view, me

urlpatterns = [
    path('register', register, name='register'),
    path('login', login_view, name='login'),
    path('me', me, name='me'),
]
