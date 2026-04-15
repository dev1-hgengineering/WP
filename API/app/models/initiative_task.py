from datetime import date, datetime
from sqlalchemy import String, Text, Boolean, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class InitiativeTask(Base):
    __tablename__ = "initiative_tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    initiative_id: Mapped[int] = mapped_column(ForeignKey("initiatives.id"), nullable=False)
    developer_id: Mapped[int] = mapped_column(ForeignKey("developers.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    is_recurring: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    recurrence_pattern: Mapped[str | None] = mapped_column(String(100), nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    initiative: Mapped["Initiative"] = relationship("Initiative", back_populates="tasks")  # noqa: F821
    developer: Mapped["Developer"] = relationship("Developer", back_populates="initiative_tasks")  # noqa: F821
