from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.initiative import InitiativeCreate, InitiativeUpdate, InitiativeResponse, AssignDeveloperRequest
from app.services import initiative_service as svc

router = APIRouter(prefix="/initiatives", tags=["initiatives"])


@router.get("/", response_model=list[InitiativeResponse])
def list_initiatives(db: Session = Depends(get_db)):
    return svc.get_all(db)


@router.get("/{initiative_id}", response_model=InitiativeResponse)
def get_initiative(initiative_id: int, db: Session = Depends(get_db)):
    data = svc.get_by_id(db, initiative_id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Initiative not found")
    return data


@router.post("/", response_model=InitiativeResponse, status_code=status.HTTP_201_CREATED)
def create_initiative(data: InitiativeCreate, db: Session = Depends(get_db)):
    return svc.create(db, data)


@router.put("/{initiative_id}", response_model=InitiativeResponse)
def update_initiative(initiative_id: int, data: InitiativeUpdate, db: Session = Depends(get_db)):
    result = svc.update(db, initiative_id, data)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Initiative not found")
    return result


@router.delete("/{initiative_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_initiative(initiative_id: int, db: Session = Depends(get_db)):
    if not svc.delete(db, initiative_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Initiative not found")


@router.post("/{initiative_id}/developers", status_code=status.HTTP_204_NO_CONTENT)
def assign_developer(initiative_id: int, body: AssignDeveloperRequest, db: Session = Depends(get_db)):
    svc.assign_developer(db, initiative_id, body.developer_id)


@router.delete("/{initiative_id}/developers/{developer_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_developer(initiative_id: int, developer_id: int, db: Session = Depends(get_db)):
    if not svc.remove_developer(db, initiative_id, developer_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Developer not in initiative")
