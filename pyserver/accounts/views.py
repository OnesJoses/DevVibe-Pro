from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
import json


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
	try:
		data = json.loads(request.body.decode('utf-8'))
		email = data.get('email')
		password = data.get('password')
		name = data.get('name')
		if not email or not password:
			return JsonResponse({'message': 'Email and password are required'}, status=400)
		if User.objects.filter(username=email).exists():
			return JsonResponse({'message': 'User already exists'}, status=400)
		user = User.objects.create_user(username=email, email=email, password=password, first_name=name or '')
		refresh = RefreshToken.for_user(user)
		return JsonResponse({
			'token': str(refresh.access_token),
			'user': {'id': user.id, 'email': user.email, 'name': user.first_name or None}
		}, status=201)
	except Exception as e:
		return JsonResponse({'message': 'Registration failed'}, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
	try:
		data = json.loads(request.body.decode('utf-8'))
		email = data.get('email')
		password = data.get('password')
		if not email or not password:
			return JsonResponse({'message': 'Email and password are required'}, status=400)
		user = authenticate(username=email, password=password)
		if not user:
			return JsonResponse({'message': 'Invalid credentials'}, status=401)
		refresh = RefreshToken.for_user(user)
		return JsonResponse({
			'token': str(refresh.access_token),
			'user': {'id': user.id, 'email': user.email, 'name': user.first_name or None}
		})
	except Exception:
		return JsonResponse({'message': 'Login failed'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
	u = request.user
	return JsonResponse({'id': u.id, 'email': u.email, 'name': u.first_name or None})


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
	try:
		data = json.loads(request.body.decode('utf-8'))
		email = data.get('email')
		if not email:
			return JsonResponse({'message': 'Email is required'}, status=400)
		
		try:
			user = User.objects.get(email=email)
		except User.DoesNotExist:
			# Don't reveal if email exists or not for security
			return JsonResponse({'message': 'If the email exists, a reset link has been sent'})
		
		# Generate reset token
		token = default_token_generator.make_token(user)
		uid = urlsafe_base64_encode(force_bytes(user.pk))
		
		# For production, you'll want a real frontend URL
		frontend_url = getattr(settings, 'FRONTEND_URL', 'https://onesmus-workspace-site.vercel.app')
		reset_url = f"{frontend_url}/#/reset-password?uid={uid}&token={token}"
		
		# Send email
		subject = 'Password Reset Request'
		message = f'''
Hello,

You requested a password reset for your DevVibe Pro account.

Click the link below to reset your password:
{reset_url}

If you didn't request this, please ignore this email.

Best regards,
DevVibe Pro Team
'''
		
		try:
			send_mail(
				subject,
				message,
				settings.DEFAULT_FROM_EMAIL,
				[email],
				fail_silently=False,
			)
			return JsonResponse({'message': 'If the email exists, a reset link has been sent'})
		except Exception as e:
			print(f"Email sending failed: {e}")
			return JsonResponse({'message': 'Failed to send email. Please try again later.'}, status=500)
			
	except Exception as e:
		print(f"Forgot password error: {e}")
		return JsonResponse({'message': 'Failed to process request'}, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
	try:
		data = json.loads(request.body.decode('utf-8'))
		uid = data.get('uid')
		token = data.get('token')
		new_password = data.get('password')
		
		if not all([uid, token, new_password]):
			return JsonResponse({'message': 'Missing required fields'}, status=400)
		
		try:
			user_id = force_str(urlsafe_base64_decode(uid))
			user = User.objects.get(pk=user_id)
		except (TypeError, ValueError, OverflowError, User.DoesNotExist):
			return JsonResponse({'message': 'Invalid reset link'}, status=400)
		
		if not default_token_generator.check_token(user, token):
			return JsonResponse({'message': 'Invalid or expired reset link'}, status=400)
		
		# Reset the password
		user.set_password(new_password)
		user.save()
		
		return JsonResponse({'message': 'Password reset successfully'})
		
	except Exception as e:
		print(f"Reset password error: {e}")
		return JsonResponse({'message': 'Failed to reset password'}, status=400)


# Create your views here.
