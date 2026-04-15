from datetime import date, datetime
from pydantic import BaseModel


class DeveloperTaskBase(BaseModel):
    developer_id: int
    title: str
    description: str | None = None
    status: str = "pending"
    is_recurring: bool = False
    recurrence_pattern: str | None = None
    due_date: date | None = None


class DeveloperTaskCreate(DeveloperTaskBase):
    pass


class DeveloperTaskUpdate(DeveloperTaskBase):
    pass


class StatusPatch(BaseModel):
    status: str


class DeveloperTaskResponse(DeveloperTaskBase):
    id: int
    developer_name: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
