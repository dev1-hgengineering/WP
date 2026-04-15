from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from app.models.initiative_task import InitiativeTask
from app.schemas.initiative_task import InitiativeTaskCreate, InitiativeTaskUpdate


def _with_relations(q):
    return q.options(
        joinedload(InitiativeTask.initiative),
        joinedload(InitiativeTask.developer),
    )


def _enrich(task: InitiativeTask) -> dict:
    data = {c.name: getattr(task, c.name) for c in task.__table__.columns}
    data["initiative_name"] = task.initiative.name if task.initiative else ""
    data["developer_name"] = task.developer.name if task.developer else ""
    return data


def get_all(db: Session, initiative_id: int | None = None, developer_id: int | None = None, status: str | None = None) -> list[dict]:
    q = _with_relations(db.query(InitiativeTask))
    if initiative_id:
        q = q.filter(InitiativeTask.initiative_id == initiative_id)
    if developer_id:
        q = q.filter(InitiativeTask.developer_id == developer_id)
    if status:
        q = q.filter(InitiativeTask.status == status)
    return [_enrich(t) for t in q.order_by(InitiativeTask.due_date.asc().nulls_last()).all()]


def get_by_id(db: Session, task_id: int) -> dict | None:
    task = _with_relations(db.query(InitiativeTask)).filter(InitiativeTask.id == task_id).first()
    return _enrich(task) if task else None


def create(db: Session, data: InitiativeTaskCreate) -> dict:
    task = InitiativeTask(**data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return get_by_id(db, task.id)


def update(db: Session, task_id: int, data: InitiativeTaskUpdate) -> dict | None:
    task = db.query(InitiativeTask).filter(InitiativeTask.id == task_id).first()
    if not task:
        return None
    for field, value in data.model_dump().items():
        setattr(task, field, value)
    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    return get_by_id(db, task_id)


def patch_status(db: Session, task_id: int, status: str) -> dict | None:
    task = db.query(InitiativeTask).filter(InitiativeTask.id == task_id).first()
    if not task:
        return None
    task.status = status
    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    return get_by_id(db, task_id)


def delete(db: Session, task_id: int) -> bool:
    task = db.query(InitiativeTask).filter(InitiativeTask.id == task_id).first()
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True
