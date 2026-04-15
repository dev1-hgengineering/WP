from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.developer import DeveloperCreate, DeveloperUpdate, DeveloperResponse
from app.services import developer_service as svc

router = APIRouter(prefix="/developers", tags=["developers"])


@router.get("/", response_model=list[DeveloperResponse])
def list_developers(db: Session = Depends(get_db)):
    return svc.get_all(db)


@router.get("/{developer_id}", response_model=DeveloperResponse)
def get_developer(developer_id: int, db: Session = Depends(get_db)):
    developer = svc.get_by_id(db, developer_id)
    if not developer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Developer not found")
    return developer


@router.post("/", response_model=DeveloperResponse, status_code=status.HTTP_201_CREATED)
def create_developer(data: DeveloperCreate, db: Session = Depends(get_db)):
    return svc.create(db, data)


@router.put("/{developer_id}", response_model=DeveloperResponse)
def update_developer(developer_id: int, data: DeveloperUpdate, db: Session = Depends(get_db)):
    developer = svc.update(db, developer_id, data)
    if not developer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Developer not found")
    return developer


@router.delete("/{developer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_developer(developer_id: int, db: Session = Depends(get_db)):
    if not svc.delete(db, developer_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Developer not found")
