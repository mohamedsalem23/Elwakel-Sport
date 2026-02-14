from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud, models, schemas, auth, database

router = APIRouter(
    prefix="/bookings",
    tags=["bookings"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    # Check for time overlap with existing confirmed bookings
    overlap = crud.check_booking_overlap(db, booking.start_time, booking.end_time)
    if overlap:
        raise HTTPException(status_code=400, detail="This time slot overlaps with an existing booking")
    
    return crud.create_user_booking(db=db, booking=booking, user_id=current_user.id)

@router.get("/", response_model=List[schemas.Booking])
def read_bookings(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Return only active (future) bookings for current user."""
    return crud.get_active_bookings_for_user(db, user_id=current_user.id)

@router.get("/history", response_model=List[schemas.Booking])
def read_booking_history(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    """Return past (archived) bookings for current user."""
    return crud.get_past_bookings_for_user(db, user_id=current_user.id)

@router.get("/all", response_model=List[schemas.Booking])
def read_all_bookings(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_bookings(db, skip=skip, limit=limit)

@router.delete("/{booking_id}", response_model=schemas.Booking)
def delete_booking(booking_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if db_booking.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this booking")
    
    return crud.delete_booking(db=db, booking_id=booking_id)
