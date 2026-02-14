from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import crud, schemas, models, auth, database

router = APIRouter(
    tags=["events"]
)

@router.get("/events/visibility", response_model=schemas.EventsVisibilityResponse)
def get_events_visibility(db: Session = Depends(database.get_db)):
    return {"show_events_page": crud.get_events_visibility(db)}

@router.get("/events", response_model=List[schemas.Event])
def get_public_events(db: Session = Depends(database.get_db)):
    if not crud.get_events_visibility(db):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Events page is currently hidden"
        )
    return crud.get_public_events(db)

@router.get("/admin/events", response_model=List[schemas.Event])
def get_all_events_admin(
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user)
):
    return crud.get_all_events(db)

@router.post("/admin/events", response_model=schemas.Event)
def create_event_admin(
    event: schemas.EventCreate,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user)
):
    if event.end_time <= event.start_time:
        raise HTTPException(status_code=400, detail="Event end time must be after start time")
    if not event.title.strip():
        raise HTTPException(status_code=400, detail="Event title is required")
    return crud.create_event(db, event)

@router.delete("/admin/events/{event_id}", response_model=schemas.Event)
def delete_event_admin(
    event_id: int,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user)
):
    db_event = crud.delete_event(db, event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event

@router.put("/admin/events/{event_id}/toggle-active", response_model=schemas.Event)
def toggle_event_active_admin(
    event_id: int,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user)
):
    db_event = crud.toggle_event_active(db, event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event

@router.put("/admin/events/visibility", response_model=schemas.EventsVisibilityResponse)
def update_events_visibility_admin(
    payload: schemas.EventsVisibilityUpdate,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user)
):
    settings = crud.update_events_visibility(db, payload.show_events_page)
    return {"show_events_page": settings.show_events_page}
