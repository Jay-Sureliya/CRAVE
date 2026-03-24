from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        # This dictionary maps an order_id to a list of active WebSockets
        # Example: { 15: [websocket1, websocket2] }
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, order_id: int):
        await websocket.accept()
        if order_id not in self.active_connections:
            self.active_connections[order_id] = []
        self.active_connections[order_id].append(websocket)

    def disconnect(self, websocket: WebSocket, order_id: int):
        if order_id in self.active_connections:
            self.active_connections[order_id].remove(websocket)
            # Clean up the dictionary if no one is watching this order anymore
            if not self.active_connections[order_id]:
                del self.active_connections[order_id]

    async def broadcast_to_order(self, order_id: int, message: dict):
        # If the customer is currently watching this order, send them the new GPS data
        if order_id in self.active_connections:
            for connection in self.active_connections[order_id]:
                await connection.send_json(message)

# Initialize the manager so we can use it in our routes
manager = ConnectionManager()