from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.developer_task import DeveloperTaskCreate, DeveloperTaskUpdate, DeveloperTaskResponse, StatusPatch
from app.services import developer_task_service as svc

router = APIRouter(prefix="/developer-tasks", tags=["developer-tasks"])


@router.get("/", response_model=list[DeveloperTaskResponse])
def list_tasks(
    developer_id: int | None = Query(default=None),
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return svc.get_all(db, developer_id=developer_id, status=status)


@router.get("/{task_id}", response_model=DeveloperTaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = svc.get_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/", response_model=DeveloperTaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(data: DeveloperTaskCreate, db: Session = Depends(get_db)):
    return svc.create(db, data)


@router.put("/{task_id}", response_model=DeveloperTaskResponse)
def update_task(task_id: int, data: DeveloperTaskUpdate, db: Session = Depends(get_db)):
    task = svc.update(db, task_id, data)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}/status", response_model=DeveloperTaskResponse)
def patch_status(task_id: int, body: StatusPatch, db: Session = Depends(get_db)):
    task = svc.patch_status(db, task_id, body.status)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    if not svc.delete(db, task_id):
        raise HTTPException(status_code=404, detail="Task not found")
