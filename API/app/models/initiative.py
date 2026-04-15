from datetime import date, datetime
from sqlalchemy import String, Text, Boolean, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class InitiativeDeveloper(Base):
    __tablename__ = "initiative_developers"

    initiative_id: Mapped[int] = mapped_column(ForeignKey("initiatives.id"), primary_key=True)
    developer_id: Mapped[int] = mapped_column(ForeignKey("developers.id"), primary_key=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    initiative: Mapped["Initiative"] = relationship("Initiative", back_populates="initiative_developers")
    developer: Mapped["Developer"] = relationship("Developer", back_populates="initiative_developers")  # noqa: F821


class Initiative(Base):
    __tablename__ = "initiatives"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")
    is_recurring: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    recurrence_pattern: Mapped[str | None] = mapped_column(String(100), nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    initiative_developers: Mapped[list["InitiativeDeveloper"]] = relationship("InitiativeDeveloper", back_populates="initiative", cascade="all, delete-orphan")
    tasks: Mapped[list["InitiativeTask"]] = relationship("InitiativeTask", back_populates="initiative", cascade="all, delete-orphan")  # noqa: F821
