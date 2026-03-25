from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import Base, engine, SessionLocal
from app import models
from app.routes import auth, channels, messages
from app.websocket.manager import manager
from app.auth import SECRET_KEY, ALGORITHM
from app.routes import auth, channels, messages, direct_messages

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(channels.router)
app.include_router(messages.router)
app.include_router(direct_messages.router)


@app.get("/")
def read_root():
    return {"message": "Slack clone backend running"}


@app.websocket("/ws/{channel_id}")
async def websocket_endpoint(websocket: WebSocket, channel_id: int):
    token = websocket.query_params.get("token")
    db: Session = SessionLocal()

    try:
        if not token:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if user_id is None:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
        except JWTError:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        current_user = db.query(models.User).filter(models.User.id == int(user_id)).first()
        if not current_user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        await manager.connect(channel_id, websocket)
        await manager.broadcast_presence(channel_id)

        while True:
            data = await websocket.receive_json()

            if data.get("type") == "typing":
                await manager.broadcast(
                    channel_id,
                    {
                        "type": "typing",
                        "user": {
                            "id": current_user.id,
                            "username": current_user.username
                        }
                    }
                )
                continue

            if data.get("type") == "message":
                new_message = models.Message(
                    content=data["content"],
                    user_id=current_user.id,
                    channel_id=channel_id
                )

                db.add(new_message)
                db.commit()
                db.refresh(new_message)

                payload = {
                    "type": "message",
                    "id": new_message.id,
                    "content": new_message.content,
                    "user_id": new_message.user_id,
                    "channel_id": new_message.channel_id,
                    "created_at": str(new_message.created_at),
                    "user": {
                        "id": current_user.id,
                        "username": current_user.username
                    }
                }

                await manager.broadcast(channel_id, payload)

    except WebSocketDisconnect:
        manager.disconnect(channel_id, websocket)
        await manager.broadcast_presence(channel_id)
    finally:
        db.close()