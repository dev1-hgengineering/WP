from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.achievement import Achievement
from app.schemas.achievement import AchievementCreate, AchievementUpdate


def get_all(db: Session) -> list[Achievement]:
    return db.query(Achievement).order_by(Achievement.date.desc()).all()


def get_by_id(db: Session, achievement_id: int) -> Achievement | None:
    return db.query(Achievement).filter(Achievement.id == achievement_id).first()


def create(db: Session, data: AchievementCreate) -> Achievement:
    achievement = Achievement(**data.model_dump())
    db.add(achievement)
    db.commit()
    db.refresh(achievement)
    return achievement


def update(db: Session, achievement_id: int, data: AchievementUpdate) -> Achievement | None:
    achievement = get_by_id(db, achievement_id)
    if not achievement:
        return None
    for field, value in data.model_dump().items():
        setattr(achievement, field, value)
    achievement.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(achievement)
    return achievement


def delete(db: Session, achievement_id: int) -> bool:
    achievement = get_by_id(db, achievement_id)
    if not achievement:
        return False
    db.delete(achievement)
    db.commit()
    return True


def format_as_text(achievements: list[Achievement]) -> str:
    if not achievements:
        return "No achievements found.\n"
    lines = []
    divider = "=" * 48
    for a in achievements:
        lines.append(divider)
        lines.append(f"Title:        {a.title}")
        lines.append(f"Date:         {a.date}")
        lines.append(f"Team:         {a.team_name}")
        lines.append(f"Project:      {a.project_name}")
        if a.description:
            lines.append(f"Description:")
            for para in a.description.splitlines():
                lines.append(f"  {para}")
        lines.append("")
    lines.append(divider)
    return "\n".join(lines)
