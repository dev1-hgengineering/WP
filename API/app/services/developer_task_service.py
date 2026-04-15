from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from app.models.developer_task import DeveloperTask
from app.schemas.developer_task import DeveloperTaskCreate, DeveloperTaskUpdate


def _with_developer(q):
    return q.options(joinedload(DeveloperTask.developer))


def _enrich(task: DeveloperTask) -> dict:
    data = {c.name: getattr(task, c.name) for c in task.__table__.columns}
    data["developer_name"] = task.developer.name if task.developer else ""
    return data


def get_all(db: Session, developer_id: int | None = None, status: str | None = None) -> list[dict]:
    q = _with_developer(db.query(DeveloperTask))
    if developer_id:
        q = q.filter(DeveloperTask.developer_id == developer_id)
    if status:
        q = q.filter(DeveloperTask.status == status)
    return [_enrich(t) for t in q.order_by(DeveloperTask.due_date.asc().nulls_last()).all()]


def get_by_id(db: Session, task_id: int) -> dict | None:
    task = _with_developer(db.query(DeveloperTask)).filter(DeveloperTask.id == task_id).first()
    return _enrich(task) if task else None


def create(db: Session, data: DeveloperTaskCreate) -> dict:
    task = DeveloperTask(**data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return get_by_id(db, task.id)


def update(db: Session, task_id: int, data: DeveloperTaskUpdate) -> dict | None:
    task = db.query(DeveloperTask).filter(DeveloperTask.id == task_id).first()
    if not task:
        return None
    for field, value in data.model_dump().items():
        setattr(task, field, value)
    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    return get_by_id(db, task_id)


def patch_status(db: Session, task_id: int, status: str) -> dict | None:
    task = db.query(DeveloperTask).filter(DeveloperTask.id == task_id).first()
    if not task:
        return None
    task.status = status
    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    return get_by_id(db, task_id)


def delete(db: Session, task_id: int) -> bool:
    task = db.query(DeveloperTask).filter(DeveloperTask.id == task_id).first()
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True
