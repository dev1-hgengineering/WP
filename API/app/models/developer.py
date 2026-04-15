from datetime import datetime
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Developer(Base):
    __tablename__ = "developers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    initiative_developers: Mapped[list["InitiativeDeveloper"]] = relationship("InitiativeDeveloper", back_populates="developer")  # noqa: F821
    initiative_tasks: Mapped[list["InitiativeTask"]] = relationship("InitiativeTask", back_populates="developer")  # noqa: F821
    developer_tasks: Mapped[list["DeveloperTask"]] = relationship("DeveloperTask", back_populates="developer", cascade="all, delete-orphan")  # noqa: F821
