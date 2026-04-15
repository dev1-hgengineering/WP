from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.developer import Developer
from app.schemas.developer import DeveloperCreate, DeveloperUpdate


def get_all(db: Session) -> list[Developer]:
    return db.query(Developer).order_by(Developer.name).all()


def get_by_id(db: Session, developer_id: int) -> Developer | None:
    return db.query(Developer).filter(Developer.id == developer_id).first()


def create(db: Session, data: DeveloperCreate) -> Developer:
    developer = Developer(**data.model_dump())
    db.add(developer)
    db.commit()
    db.refresh(developer)
    return developer


def update(db: Session, developer_id: int, data: DeveloperUpdate) -> Developer | None:
    developer = get_by_id(db, developer_id)
    if not developer:
        return None
    for field, value in data.model_dump().items():
        setattr(developer, field, value)
    developer.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(developer)
    return developer


def delete(db: Session, developer_id: int) -> bool:
    developer = get_by_id(db, developer_id)
    if not developer:
        return False
    db.delete(developer)
    db.commit()
    return True
