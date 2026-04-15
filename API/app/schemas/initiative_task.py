from datetime import date, datetime
from pydantic import BaseModel


class InitiativeTaskBase(BaseModel):
    initiative_id: int
    developer_id: int
    title: str
    description: str | None = None
    status: str = "pending"
    is_recurring: bool = False
    recurrence_pattern: str | None = None
    due_date: date | None = None


class InitiativeTaskCreate(InitiativeTaskBase):
    pass


class InitiativeTaskUpdate(InitiativeTaskBase):
    pass


class StatusPatch(BaseModel):
    status: str


class InitiativeTaskResponse(InitiativeTaskBase):
    id: int
    initiative_name: str
    developer_name: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
