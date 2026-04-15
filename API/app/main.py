from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import achievements, developers, initiatives, initiative_tasks, developer_tasks, todos

# Register all models with SQLAlchemy before create_all
import app.models.achievement         # noqa: F401
import app.models.developer           # noqa: F401
import app.models.initiative          # noqa: F401
import app.models.initiative_task     # noqa: F401
import app.models.developer_task      # noqa: F401
import app.models.todo               # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Office Work Tracker API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(achievements.router,     prefix="/api/v1")
app.include_router(developers.router,       prefix="/api/v1")
app.include_router(initiatives.router,      prefix="/api/v1")
app.include_router(initiative_tasks.router, prefix="/api/v1")
app.include_router(developer_tasks.router,  prefix="/api/v1")
app.include_router(todos.router,            prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}
