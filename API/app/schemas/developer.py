from datetime import datetime
from pydantic import BaseModel


class DeveloperBase(BaseModel):
    name: str
    email: str | None = None


class DeveloperCreate(DeveloperBase):
    pass


class DeveloperUpdate(DeveloperBase):
    pass


class DeveloperResponse(DeveloperBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
