from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/dm", tags=["direct-messages"])


@router.post("/", response_model=schemas.DirectMessageOut)
def send_dm(
    dm: schemas.DirectMessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_dm = models.DirectMessage(
        content=dm.content,
        sender_id=current_user.id,
        receiver_id=dm.receiver_id
    )

    db.add(new_dm)
    db.commit()
    db.refresh(new_dm)
    return new_dm


@router.get("/{user_id}", response_model=list[schemas.DirectMessageOut])
def get_dm_conversation(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.DirectMessage)
        .filter(
            ((models.DirectMessage.sender_id == current_user.id) & (models.DirectMessage.receiver_id == user_id)) |
            ((models.DirectMessage.sender_id == user_id) & (models.DirectMessage.receiver_id == current_user.id))
        )
        .order_by(models.DirectMessage.created_at.asc())
        .all()
    )