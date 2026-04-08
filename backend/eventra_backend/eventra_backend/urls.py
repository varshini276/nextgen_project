from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    path('', include('core.urls')),   # ✅ ADD THIS
    path('api/', include('core.urls')),  # ✅ KEEP THIS
]