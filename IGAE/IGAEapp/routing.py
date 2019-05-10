from django.urls import path
from .ws import consumers


channel_routing = [
   path('ws/apps/loading', consumers.AppConsumer),
]
