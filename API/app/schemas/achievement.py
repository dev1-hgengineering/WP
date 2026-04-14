from datetime import date, datetime
from pydantic import BaseModel


class AchievementBase(BaseModel):
    title: str
    description: str | None = None
    date: date
    team_name: str
    project_name: str


class AchievementCreate(AchievementBase):
    pass


class AchievementUpdate(AchievementBase):
    pass


class AchievementResponse(AchievementBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
