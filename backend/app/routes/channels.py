from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/channels", tags=["channels"])


@router.post("/", response_model=schemas.ChannelOut)
def create_channel(
    channel: schemas.ChannelCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing_channel = (
        db.query(models.Channel)
        .filter(models.Channel.name == channel.name)
        .first()
    )

    if existing_channel:
        raise HTTPException(status_code=400, detail="Channel already exists")

    new_channel = models.Channel(
        name=channel.name,
        description=channel.description
    )

    db.add(new_channel)
    db.commit()
    db.refresh(new_channel)

    return new_channel


@router.get("/", response_model=list[schemas.ChannelOut])
def list_channels(db: Session = Depends(get_db)):
    return db.query(models.Channel).all()