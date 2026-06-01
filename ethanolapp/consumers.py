# production/consumers.py
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer

class ReadingsConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # Add this socket to the "readings" group
        await self.channel_layer.group_add("readings", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Remove this socket from the "readings" group
        await self.channel_layer.group_discard("readings", self.channel_name)

    # Called by channel_layer.group_send; naming matches 'type' in event
    async def reading_created(self, event):
        await self.send_json({
            "event": event.get("event", "created"),
            "data": event.get("data")
        })

    async def reading_updated(self, event):
        await self.send_json({
            "event": event.get("event", "updated"),
            "data": event.get("data")
        })

    async def reading_deleted(self, event):
        await self.send_json({
            "event": event.get("event", "deleted"),
            "data": event.get("data")
        })
