
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import IGAEapp.routing


application = ProtocolTypeRouter({
    # (http->django views is added by default)
    
    "websocket": AuthMiddlewareStack(
        URLRouter(
            IGAEapp.routing.channel_routing
        )
    ),
})