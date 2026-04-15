from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from app.models.initiative import Initiative, InitiativeDeveloper
from app.models.initiative_task import InitiativeTask
from app.schemas.initiative import InitiativeCreate, InitiativeUpdate, TaskCounts


def _load(db: Session, initiative_id: int) -> Initiative | None:
    return (
        db.query(Initiative)
        .options(
            joinedload(Initiative.initiative_developers).joinedload(InitiativeDeveloper.developer),
            joinedload(Initiative.tasks),
        )
        .filter(Initiative.id == initiative_id)
        .first()
    )


def _build_response(initiative: Initiative) -> dict:
    data = {c.name: getattr(initiative, c.name) for c in initiative.__table__.columns}
    data["developers"] = [
        {"id": m.developer.id, "name": m.developer.name, "email": m.developer.email}
        for m in initiative.initiative_developers
    ]
    tasks = initiative.tasks
    counts = TaskCounts(
        total=len(tasks),
        pending=sum(1 for t in tasks if t.status == "pending"),
        in_progress=sum(1 for t in tasks if t.status == "in_progress"),
        completed=sum(1 for t in tasks if t.status == "completed"),
        blocked=sum(1 for t in tasks if t.status == "blocked"),
    )
    data["task_counts"] = counts
    return data


def get_all(db: Session) -> list[dict]:
    initiatives = (
        db.query(Initiative)
        .options(
            joinedload(Initiative.initiative_developers).joinedload(InitiativeDeveloper.developer),
            joinedload(Initiative.tasks),
        )
        .order_by(Initiative.name)
        .all()
    )
    return [_build_response(i) for i in initiatives]


def get_by_id(db: Session, initiative_id: int) -> dict | None:
    initiative = _load(db, initiative_id)
    if not initiative:
        return None
    return _build_response(initiative)


def create(db: Session, data: InitiativeCreate) -> dict:
    initiative = Initiative(**data.model_dump())
    db.add(initiative)
    db.commit()
    db.refresh(initiative)
    return _build_response(_load(db, initiative.id))


def update(db: Session, initiative_id: int, data: InitiativeUpdate) -> dict | None:
    initiative = db.query(Initiative).filter(Initiative.id == initiative_id).first()
    if not initiative:
        return None
    for field, value in data.model_dump().items():
        setattr(initiative, field, value)
    initiative.updated_at = datetime.now(timezone.utc)
    db.commit()
    return _build_response(_load(db, initiative_id))


def delete(db: Session, initiative_id: int) -> bool:
    initiative = db.query(Initiative).filter(Initiative.id == initiative_id).first()
    if not initiative:
        return False
    db.delete(initiative)
    db.commit()
    return True


def assign_developer(db: Session, initiative_id: int, developer_id: int) -> bool:
    exists = db.query(InitiativeDeveloper).filter_by(
        initiative_id=initiative_id, developer_id=developer_id
    ).first()
    if exists:
        return False
    db.add(InitiativeDeveloper(initiative_id=initiative_id, developer_id=developer_id))
    db.commit()
    return True


def remove_developer(db: Session, initiative_id: int, developer_id: int) -> bool:
    member = db.query(InitiativeDeveloper).filter_by(
        initiative_id=initiative_id, developer_id=developer_id
    ).first()
    if not member:
        return False
    db.delete(member)
    db.commit()
    return True
