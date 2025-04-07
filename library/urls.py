from django.urls import path
from . import views
from . import views_api
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    path('', views.home, name='home'),
    path('asset/<str:asset_name>/', views.asset_detail, name='asset_detail'),
    path('download/asset/<str:assetName>/', views.download_asset_by_name, name='download_asset_by_name'),

    # API views
    path('api/assets/', views_api.get_assets, name='api_assets'),
    path('api/assets/<str:asset_name>/', views_api.get_asset, name='api_asset'),
    path('api/upload_S3/<str:asset_name>/', views_api.upload_S3_asset, name='upload_S3_asset'),
    path('api/assets/<str:asset_name>/checkout/', views_api.checkout_asset, name='api_asset_checkout'),
    path('api/assets/<str:asset_name>/download/', views_api.download_asset, name='api_asset_download'),
    path('api/commits/', views_api.get_commits, name='get_commits'),
    path('api/commits/<str:commit_id>/', views_api.get_commit, name='get_commit'),
    path('api/users/', views_api.get_users, name='get_users'),
    path('api/users/<str:pennkey>/', views_api.get_user, name='get_user'),
    # API Schema URLs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Optional UI:
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]