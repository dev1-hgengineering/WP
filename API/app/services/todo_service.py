from datetime import date, datetime, timezone
from sqlalchemy.orm import Session, joinedload
from app.models.todo import RecurringTodo, TimelineTodo, DailyList, DailyTask
from app.schemas.todo import (
    RecurringTodoCreate, RecurringTodoUpdate,
    TimelineTodoCreate, TimelineTodoUpdate,
    DailyTaskCreate,
)


# ── Recurring ────────────────────────────────────────────────

def get_recurring(db: Session) -> list[RecurringTodo]:
    return db.query(RecurringTodo).order_by(RecurringTodo.title).all()


def create_recurring(db: Session, data: RecurringTodoCreate) -> RecurringTodo:
    todo = RecurringTodo(**data.model_dump())
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


def update_recurring(db: Session, todo_id: int, data: RecurringTodoUpdate) -> RecurringTodo | None:
    todo = db.query(RecurringTodo).filter(RecurringTodo.id == todo_id).first()
    if not todo:
        return None
    for k, v in data.model_dump().items():
        setattr(todo, k, v)
    todo.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(todo)
    return todo


def toggle_recurring(db: Session, todo_id: int) -> RecurringTodo | None:
    todo = db.query(RecurringTodo).filter(RecurringTodo.id == todo_id).first()
    if not todo:
        return None
    todo.is_active = not todo.is_active
    todo.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(todo)
    return todo


def delete_recurring(db: Session, todo_id: int) -> bool:
    todo = db.query(RecurringTodo).filter(RecurringTodo.id == todo_id).first()
    if not todo:
        return False
    db.delete(todo)
    db.commit()
    return True


# ── Timeline ─────────────────────────────────────────────────

def get_timeline(db: Session, status: str | None = None) -> list[TimelineTodo]:
    q = db.query(TimelineTodo)
    if status:
        q = q.filter(TimelineTodo.status == status)
    return q.order_by(TimelineTodo.due_date.asc()).all()


def create_timeline(db: Session, data: TimelineTodoCreate) -> TimelineTodo:
    todo = TimelineTodo(**data.model_dump())
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


def update_timeline(db: Session, todo_id: int, data: TimelineTodoUpdate) -> TimelineTodo | None:
    todo = db.query(TimelineTodo).filter(TimelineTodo.id == todo_id).first()
    if not todo:
        return None
    for k, v in data.model_dump().items():
        setattr(todo, k, v)
    todo.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(todo)
    return todo


def patch_timeline_status(db: Session, todo_id: int, status: str) -> TimelineTodo | None:
    todo = db.query(TimelineTodo).filter(TimelineTodo.id == todo_id).first()
    if not todo:
        return None
    todo.status = status
    todo.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(todo)
    return todo


def delete_timeline(db: Session, todo_id: int) -> bool:
    todo = db.query(TimelineTodo).filter(TimelineTodo.id == todo_id).first()
    if not todo:
        return False
    db.delete(todo)
    db.commit()
    return True


# ── Daily ─────────────────────────────────────────────────────

def get_daily_list(db: Session, list_date: date) -> DailyList | None:
    return (
        db.query(DailyList)
        .options(joinedload(DailyList.tasks))
        .filter(DailyList.date == list_date)
        .first()
    )


def get_or_create_daily_list(db: Session, list_date: date) -> DailyList:
    existing = get_daily_list(db, list_date)
    if existing:
        return existing
    dl = DailyList(date=list_date)
    db.add(dl)
    db.commit()
    db.refresh(dl)
    return db.query(DailyList).options(joinedload(DailyList.tasks)).filter(DailyList.id == dl.id).first()


def get_all_daily_lists(db: Session) -> list[DailyList]:
    return db.query(DailyList).order_by(DailyList.date.desc()).all()


def add_daily_task(db: Session, list_id: int, data: DailyTaskCreate) -> DailyTask:
    task = DailyTask(list_id=list_id, **data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def toggle_daily_task(db: Session, task_id: int) -> DailyTask | None:
    task = db.query(DailyTask).filter(DailyTask.id == task_id).first()
    if not task:
        return None
    task.is_done = not task.is_done
    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    return task


def delete_daily_task(db: Session, task_id: int) -> bool:
    task = db.query(DailyTask).filter(DailyTask.id == task_id).first()
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True
