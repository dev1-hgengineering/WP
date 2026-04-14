from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.achievement import AchievementCreate, AchievementUpdate, AchievementResponse
from app.services import achievement_service as svc
import io

router = APIRouter(prefix="/achievements", tags=["achievements"])


# NOTE: /download must be registered before /{id} to avoid route conflict
@router.get("/download")
def download_achievements(db: Session = Depends(get_db)):
    achievements = svc.get_all(db)
    content = svc.format_as_text(achievements)
    return StreamingResponse(
        io.StringIO(content),
        media_type="text/plain",
        headers={"Content-Disposition": "attachment; filename=achievements.txt"},
    )


@router.get("/", response_model=list[AchievementResponse])
def list_achievements(db: Session = Depends(get_db)):
    return svc.get_all(db)


@router.get("/{achievement_id}", response_model=AchievementResponse)
def get_achievement(achievement_id: int, db: Session = Depends(get_db)):
    achievement = svc.get_by_id(db, achievement_id)
    if not achievement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")
    return achievement


@router.post("/", response_model=AchievementResponse, status_code=status.HTTP_201_CREATED)
def create_achievement(data: AchievementCreate, db: Session = Depends(get_db)):
    return svc.create(db, data)


@router.put("/{achievement_id}", response_model=AchievementResponse)
def update_achievement(achievement_id: int, data: AchievementUpdate, db: Session = Depends(get_db)):
    achievement = svc.update(db, achievement_id, data)
    if not achievement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")
    return achievement


@router.delete("/{achievement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_achievement(achievement_id: int, db: Session = Depends(get_db)):
    if not svc.delete(db, achievement_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found")
