from django.urls import path
from .views import register, login_view, me, forgot_password, reset_password

urlpatterns = [
    path('register', register, name='register'),
    path('login', login_view, name='login'),
    path('me', me, name='me'),
    path('forgot-password', forgot_password, name='forgot_password'),
    path('reset-password', reset_password, name='reset_password'),
]
