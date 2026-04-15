from datetime import date, datetime
from pydantic import BaseModel


# ── Recurring ────────────────────────────────────────────────
class RecurringTodoBase(BaseModel):
    title: str
    description: str | None = None
    recurrence_pattern: str
    is_active: bool = True


class RecurringTodoCreate(RecurringTodoBase):
    pass


class RecurringTodoUpdate(RecurringTodoBase):
    pass


class RecurringTodoResponse(RecurringTodoBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ── Timeline ─────────────────────────────────────────────────
class TimelineTodoBase(BaseModel):
    title: str
    description: str | None = None
    due_date: date
    priority: str = "medium"
    status: str = "pending"


class TimelineTodoCreate(TimelineTodoBase):
    pass


class TimelineTodoUpdate(TimelineTodoBase):
    pass


class TimelineStatusPatch(BaseModel):
    status: str


class TimelineTodoResponse(TimelineTodoBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ── Daily ─────────────────────────────────────────────────────
class DailyTaskCreate(BaseModel):
    title: str
    sort_order: int = 0


class DailyTaskResponse(BaseModel):
    id: int
    list_id: int
    title: str
    is_done: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class DailyListResponse(BaseModel):
    id: int
    date: date
    tasks: list[DailyTaskResponse] = []
    created_at: datetime
    model_config = {"from_attributes": True}
