from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import achievements

# Create all tables on startup (alternatively use Alembic migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Office Work Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(achievements.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}
