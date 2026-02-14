from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud, models, schemas, auth, database

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(auth.get_current_admin_user)],
    responses={404: {"description": "Not found"}},
)

@router.get("/bookings", response_model=List[schemas.Booking])
def read_all_bookings_admin(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_bookings(db, skip=skip, limit=limit)

@router.delete("/bookings/{booking_id}", response_model=schemas.Booking)
def delete_booking_admin(booking_id: int, db: Session = Depends(database.get_db)):
    db_booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not db_booking:
         raise HTTPException(status_code=404, detail="Booking not found")
    return crud.delete_booking(db=db, booking_id=booking_id)

@router.get("/users", response_model=List[schemas.User])
def read_all_users(db: Session = Depends(database.get_db)):
    return crud.get_all_users(db)

@router.delete("/users/{user_id}")
def delete_user_admin(user_id: int, db: Session = Depends(database.get_db)):
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot delete an admin user")
    crud.delete_user(db, user_id=user_id)
    return {"message": f"User {user.username} deleted successfully"}

@router.get("/stats")
def get_admin_stats(db: Session = Depends(database.get_db)):
    return crud.get_stats(db)
