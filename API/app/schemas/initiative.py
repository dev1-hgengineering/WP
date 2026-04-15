from datetime import date, datetime
from pydantic import BaseModel


class InitiativeBase(BaseModel):
    name: str
    description: str | None = None
    status: str = "active"
    is_recurring: bool = False
    recurrence_pattern: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class InitiativeCreate(InitiativeBase):
    pass


class InitiativeUpdate(InitiativeBase):
    pass


class DeveloperSummary(BaseModel):
    id: int
    name: str
    email: str | None = None

    model_config = {"from_attributes": True}


class TaskCounts(BaseModel):
    total: int = 0
    pending: int = 0
    in_progress: int = 0
    completed: int = 0
    blocked: int = 0


class InitiativeResponse(InitiativeBase):
    id: int
    developers: list[DeveloperSummary] = []
    task_counts: TaskCounts = TaskCounts()
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AssignDeveloperRequest(BaseModel):
    developer_id: int
