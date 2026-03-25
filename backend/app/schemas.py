from pydantic import BaseModel
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class ChannelCreate(BaseModel):
    name: str
    description: str | None = None


class ChannelOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class MessageCreate(BaseModel):
    content: str
    user_id: int
    channel_id: int


class MessageOut(BaseModel):
    id: int
    content: str
    user_id: int
    channel_id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    email: str

class DirectMessageCreate(BaseModel):
    receiver_id: int
    content: str


class DirectMessageOut(BaseModel):
    id: int
    content: str
    sender_id: int
    receiver_id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

