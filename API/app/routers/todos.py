from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.todo import (
    RecurringTodoCreate, RecurringTodoUpdate, RecurringTodoResponse,
    TimelineTodoCreate, TimelineTodoUpdate, TimelineTodoResponse, TimelineStatusPatch,
    DailyTaskCreate, DailyTaskResponse, DailyListResponse,
)
from app.services import todo_service as svc

router = APIRouter(prefix="/todos", tags=["todos"])


# ── Recurring ────────────────────────────────────────────────

@router.get("/recurring/", response_model=list[RecurringTodoResponse])
def list_recurring(db: Session = Depends(get_db)):
    return svc.get_recurring(db)


@router.post("/recurring/", response_model=RecurringTodoResponse, status_code=201)
def create_recurring(data: RecurringTodoCreate, db: Session = Depends(get_db)):
    return svc.create_recurring(db, data)


@router.put("/recurring/{todo_id}", response_model=RecurringTodoResponse)
def update_recurring(todo_id: int, data: RecurringTodoUpdate, db: Session = Depends(get_db)):
    todo = svc.update_recurring(db, todo_id, data)
    if not todo:
        raise HTTPException(404, "Not found")
    return todo


@router.patch("/recurring/{todo_id}/toggle", response_model=RecurringTodoResponse)
def toggle_recurring(todo_id: int, db: Session = Depends(get_db)):
    todo = svc.toggle_recurring(db, todo_id)
    if not todo:
        raise HTTPException(404, "Not found")
    return todo


@router.delete("/recurring/{todo_id}", status_code=204)
def delete_recurring(todo_id: int, db: Session = Depends(get_db)):
    if not svc.delete_recurring(db, todo_id):
        raise HTTPException(404, "Not found")


# ── Timeline ─────────────────────────────────────────────────

@router.get("/timeline/", response_model=list[TimelineTodoResponse])
def list_timeline(status: str | None = Query(default=None), db: Session = Depends(get_db)):
    return svc.get_timeline(db, status=status)


@router.post("/timeline/", response_model=TimelineTodoResponse, status_code=201)
def create_timeline(data: TimelineTodoCreate, db: Session = Depends(get_db)):
    return svc.create_timeline(db, data)


@router.put("/timeline/{todo_id}", response_model=TimelineTodoResponse)
def update_timeline(todo_id: int, data: TimelineTodoUpdate, db: Session = Depends(get_db)):
    todo = svc.update_timeline(db, todo_id, data)
    if not todo:
        raise HTTPException(404, "Not found")
    return todo


@router.patch("/timeline/{todo_id}/status", response_model=TimelineTodoResponse)
def patch_timeline_status(todo_id: int, body: TimelineStatusPatch, db: Session = Depends(get_db)):
    todo = svc.patch_timeline_status(db, todo_id, body.status)
    if not todo:
        raise HTTPException(404, "Not found")
    return todo


@router.delete("/timeline/{todo_id}", status_code=204)
def delete_timeline(todo_id: int, db: Session = Depends(get_db)):
    if not svc.delete_timeline(db, todo_id):
        raise HTTPException(404, "Not found")


# ── Daily ─────────────────────────────────────────────────────

@router.get("/daily/", response_model=list[DailyListResponse])
def list_daily(db: Session = Depends(get_db)):
    return svc.get_all_daily_lists(db)


@router.get("/daily/by-date", response_model=DailyListResponse | None)
def get_daily_by_date(date: date = Query(...), db: Session = Depends(get_db)):
    return svc.get_daily_list(db, date)


@router.post("/daily/by-date", response_model=DailyListResponse, status_code=201)
def create_daily_list(date: date = Query(...), db: Session = Depends(get_db)):
    return svc.get_or_create_daily_list(db, date)


@router.post("/daily/{list_id}/tasks", response_model=DailyTaskResponse, status_code=201)
def add_daily_task(list_id: int, data: DailyTaskCreate, db: Session = Depends(get_db)):
    return svc.add_daily_task(db, list_id, data)


@router.patch("/daily/tasks/{task_id}/toggle", response_model=DailyTaskResponse)
def toggle_daily_task(task_id: int, db: Session = Depends(get_db)):
    task = svc.toggle_daily_task(db, task_id)
    if not task:
        raise HTTPException(404, "Not found")
    return task


@router.delete("/daily/tasks/{task_id}", status_code=204)
def delete_daily_task(task_id: int, db: Session = Depends(get_db)):
    if not svc.delete_daily_task(db, task_id):
        raise HTTPException(404, "Not found")
