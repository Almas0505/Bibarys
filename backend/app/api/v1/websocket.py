from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.core.websocket import manager
from app.core.security import verify_access_token
from app.core.exceptions import UnauthorizedException
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        # Verify token
        payload = verify_access_token(token)
        user_id_str = payload.get("sub")
        
        if not user_id_str:
            await websocket.close(code=4001)  # Custom: Authentication Error
            return
        
        user_id = int(user_id_str)
        
        # Connect
        await manager.connect(websocket, user_id)
        
        try:
            while True:
                # Keep connection alive, receive any client messages
                data = await websocket.receive_text()
                logger.debug(f"Received from user {user_id}: {data}")
        
        except WebSocketDisconnect:
            manager.disconnect(websocket, user_id)
    
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close(code=1011)
