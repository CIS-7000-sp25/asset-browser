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
    path('api/assets/<str:asset_name>/', views_api.upload_S3_asset, name='api_asset_upload'),
    path('api/metadata/<str:asset_name>/', views_api.post_metadata, name='api_metadata_upload'),
    path('api/metadata/<str:asset_name>/', views_api.put_metadata, name='api_metadata_update'),
    path('api/assets/<str:asset_name>/checkout/', views_api.checkout_asset, name='api_asset_checkout'),
    # path('api/assets/<str:asset_name>/checkin/', views_api.checkin_asset, name='api_asset_checkin'),
]