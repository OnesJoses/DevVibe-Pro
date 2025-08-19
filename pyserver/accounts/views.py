from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
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

# Create your views here.
