from channels.consumer import AsyncConsumer
from ..controllers.resources.background import DjangoBackground


class AppConsumer(AsyncConsumer):
    
    async def websocket_connect(self, event):
        await self.send({
            "type": "websocket.accept"
        })

    async def websocket_receive(self, event):
        ans = event['text'].split(":")
        db = DjangoBackground()
        b = db.get_progress(ans[0])
        #if ans[0] == 'Renfe': b = True
        if b :
            text = ans[1] + ":true"
        else:
            text = ans[1] + ":false"
        await self.send({
            "type": "websocket.send",
            "text": text
        })

    # async def websocket_send(self):
        

    async def websocket_disconnect(self, event):
        await self.send({
            "type": "websocket.disconnect",
        })

    #async def print_msg(self, msg):
     #   await print(msg)
