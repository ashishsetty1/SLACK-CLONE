from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/messages", tags=["messages"])


@router.post("/", response_model=schemas.MessageOut)
def create_message(
    message: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_message = models.Message(
        content=message.content,
        user_id=current_user.id,
        channel_id=message.channel_id
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    new_message = (
        db.query(models.Message)
        .options(joinedload(models.Message.user))
        .filter(models.Message.id == new_message.id)
        .first()
    )

    return new_message


@router.get("/{channel_id}", response_model=list[schemas.MessageOut])
def get_channel_messages(channel_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Message)
        .options(joinedload(models.Message.user))
        .filter(models.Message.channel_id == channel_id)
        .order_by(models.Message.created_at.asc())
        .all()
    )


@router.put("/{message_id}", response_model=schemas.MessageOut)
def update_message(
    message_id: int,
    message: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_message = db.query(models.Message).filter(models.Message.id == message_id).first()

    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")

    if db_message.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to edit this message")

    db_message.content = message.content
    db.commit()
    db.refresh(db_message)

    db_message = (
        db.query(models.Message)
        .options(joinedload(models.Message.user))
        .filter(models.Message.id == db_message.id)
        .first()
    )

    return db_message


@router.delete("/{message_id}")
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_message = db.query(models.Message).filter(models.Message.id == message_id).first()

    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")

    if db_message.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to delete this message")

    db.delete(db_message)
    db.commit()

    return {"detail": "Message deleted"}