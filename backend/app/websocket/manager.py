from collections import defaultdict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections = defaultdict(list)

    async def connect(self, channel_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[channel_id].append(websocket)

    def disconnect(self, channel_id: int, websocket: WebSocket):
        if websocket in self.active_connections[channel_id]:
            self.active_connections[channel_id].remove(websocket)

    async def broadcast(self, channel_id: int, message: dict):
        for connection in self.active_connections[channel_id]:
            await connection.send_json(message)

    async def broadcast_presence(self, channel_id: int):
        count = len(self.active_connections[channel_id])
        payload = {"type": "presence", "count": count}
        for connection in self.active_connections[channel_id]:
            await connection.send_json(payload)


manager = ConnectionManager()