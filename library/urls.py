from django.urls import path
from . import views
from . import views_api

urlpatterns = [
    path('', views.home, name='home'),
    path('asset/<str:asset_name>/', views.asset_detail, name='asset_detail'),
    path('download/asset/<str:assetName>/', views.download_asset_by_name, name='download_asset_by_name'),

    # API views
    path('api/assets/', views_api.get_assets, name='api_assets'),
    path('api/assets/<str:asset_name>/', views_api.get_asset, name='api_asset'),
    path('api/assets/<str:asset_name>/', views_api.put_asset, name='api_asset_update'),
    path('api/assets/<str:asset_name>/', views_api.post_asset, name='api_asset_upload'),
    path('api/metadata/<str:asset_name>/', views_api.post_metadata, name='api_metadata_upload'),
    path('api/metadata/<str:asset_name>/', views_api.put_metadata, name='api_metadata_update'),
    path('api/assets/<str:asset_name>/checkout/', views_api.checkout_asset, name='api_asset_checkout'),
    path('api/assets/<str:asset_name>/download/', views_api.download_asset, name='api_asset_download'),
    path('api/commits/', views_api.get_commits, name='get_commits'),
    path('api/commits/<str:commit_id>/', views_api.get_commit, name='get_commit'),
    path('api/users/', views_api.get_users, name='get_users'),
    path('api/users/<str:pennkey>/', views_api.get_user, name='get_user'),
]