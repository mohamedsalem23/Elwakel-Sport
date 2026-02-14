from sqlalchemy.orm import Session
import models, schemas, auth
from datetime import datetime
from typing import Dict, List

def get_password_hash(password):
    return auth.pwd_context.hash(password)

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        phone_number=user.phone_number
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_all_users(db: Session):
    return db.query(models.User).all()

def delete_user(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        # Delete user's bookings first
        db.query(models.Booking).filter(models.Booking.user_id == user_id).delete()
        db.delete(user)
        db.commit()
    return user

def get_bookings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Booking).offset(skip).limit(limit).all()

def get_active_bookings_for_user(db: Session, user_id: int):
    """Return only future (active) bookings for a user."""
    now = datetime.utcnow()
    return db.query(models.Booking).filter(
        models.Booking.user_id == user_id,
        models.Booking.end_time > now,
        models.Booking.status != "cancelled"
    ).order_by(models.Booking.start_time).all()

def get_past_bookings_for_user(db: Session, user_id: int):
    """Return past (archived) bookings for a user."""
    now = datetime.utcnow()
    return db.query(models.Booking).filter(
        models.Booking.user_id == user_id,
        (models.Booking.end_time <= now) | (models.Booking.status == "cancelled")
    ).order_by(models.Booking.start_time.desc()).all()

def check_booking_overlap(db: Session, start_time, end_time, exclude_booking_id: int = None):
    """Check if a new booking overlaps with any existing confirmed booking."""
    query = db.query(models.Booking).filter(
        models.Booking.status == "confirmed",
        models.Booking.start_time < end_time,
        models.Booking.end_time > start_time
    )
    if exclude_booking_id:
        query = query.filter(models.Booking.id != exclude_booking_id)
    return query.first()

def create_user_booking(db: Session, booking: schemas.BookingCreate, user_id: int):
    db_booking = models.Booking(
        user_id=user_id,
        booker_name=booking.booker_name,
        booker_phone=booking.booker_phone,
        start_time=booking.start_time,
        end_time=booking.end_time,
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def delete_booking(db: Session, booking_id: int):
    db_booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if db_booking:
        db.delete(db_booking)
        db.commit()
    return db_booking

def get_stats(db: Session):
    """Get comprehensive statistics for admin dashboard."""
    now = datetime.utcnow()
    total_users = db.query(models.User).count()
    total_bookings = db.query(models.Booking).count()
    active_bookings = db.query(models.Booking).filter(
        models.Booking.end_time > now,
        models.Booking.status == "confirmed"
    ).count()
    past_bookings = db.query(models.Booking).filter(
        models.Booking.end_time <= now
    ).count()
    cancelled_bookings = db.query(models.Booking).filter(
        models.Booking.status == "cancelled"
    ).count()
    confirmed_bookings = db.query(models.Booking).filter(
        models.Booking.status == "confirmed"
    ).count()

    return {
        "total_users": total_users,
        "total_bookings": total_bookings,
        "active_bookings": active_bookings,
        "past_bookings": past_bookings,
        "cancelled_bookings": cancelled_bookings,
        "confirmed_bookings": confirmed_bookings,
    }

def update_user_reset_token(db: Session, user: models.User, token: str, expires: auth.datetime):
    user.reset_token = token
    user.reset_token_expires = expires
    db.commit()
    db.refresh(user)
    return user

def get_user_by_reset_token(db: Session, token: str):
    return db.query(models.User).filter(
        models.User.reset_token == token,
        models.User.reset_token_expires > auth.datetime.utcnow()
    ).first()

def update_user_password(db: Session, user: models.User, new_password: str):
    user.hashed_password = get_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    db.refresh(user)
    return user

def update_user_phone_and_password(db: Session, user: models.User, phone_number: str, new_password: str):
    user.phone_number = phone_number
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(user)
    return user

def get_or_create_site_settings(db: Session):
    settings = db.query(models.SiteSetting).first()
    if not settings:
        settings = models.SiteSetting(show_events_page=False)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def get_events_visibility(db: Session):
    settings = get_or_create_site_settings(db)
    return settings.show_events_page

def update_events_visibility(db: Session, show_events_page: bool):
    settings = get_or_create_site_settings(db)
    settings.show_events_page = show_events_page
    db.commit()
    db.refresh(settings)
    return settings

def create_event(db: Session, event: schemas.EventCreate):
    db_event = models.Event(
        title=event.title.strip(),
        description=(event.description or "").strip() or None,
        location=(event.location or "").strip() or None,
        start_time=event.start_time,
        end_time=event.end_time,
        is_active=event.is_active,
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

def get_event_by_id(db: Session, event_id: int):
    return db.query(models.Event).filter(models.Event.id == event_id).first()

def get_all_events(db: Session):
    return db.query(models.Event).order_by(models.Event.start_time.asc()).all()

def get_public_events(db: Session):
    now = datetime.utcnow()
    return db.query(models.Event).filter(
        models.Event.is_active == True,
        models.Event.end_time >= now
    ).order_by(models.Event.start_time.asc()).all()

def delete_event(db: Session, event_id: int):
    db_event = get_event_by_id(db, event_id)
    if db_event:
        db.delete(db_event)
        db.commit()
    return db_event

def toggle_event_active(db: Session, event_id: int):
    db_event = get_event_by_id(db, event_id)
    if not db_event:
        return None
    db_event.is_active = not db_event.is_active
    db.commit()
    db.refresh(db_event)
    return db_event

def get_tournaments_visibility(db: Session):
    settings = get_or_create_site_settings(db)
    return settings.show_tournaments_page

def update_tournaments_visibility(db: Session, show_tournaments_page: bool):
    settings = get_or_create_site_settings(db)
    settings.show_tournaments_page = show_tournaments_page
    db.commit()
    db.refresh(settings)
    return settings

def create_team(db: Session, team: schemas.TeamCreate):
    db_team = models.Team(
        name=team.name.strip(),
        coach_name=(team.coach_name or "").strip() or None,
        contact_phone=(team.contact_phone or "").strip() or None,
    )
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

def get_team(db: Session, team_id: int):
    return db.query(models.Team).filter(models.Team.id == team_id).first()

def get_teams(db: Session):
    return db.query(models.Team).order_by(models.Team.name.asc()).all()

def add_player_to_team(db: Session, team_id: int, player: schemas.TeamPlayerCreate):
    db_player = models.TeamPlayer(
        team_id=team_id,
        name=player.name.strip(),
        jersey_number=player.jersey_number,
        position=(player.position or "").strip() or None,
    )
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

def create_tournament(db: Session, tournament: schemas.TournamentCreate):
    db_tournament = models.Tournament(
        title=tournament.title.strip(),
        description=(tournament.description or "").strip() or None,
        start_date=tournament.start_date,
        end_date=tournament.end_date,
        status=tournament.status,
        is_active=tournament.is_active,
    )
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

def get_tournament(db: Session, tournament_id: int):
    return db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()

def get_tournaments(db: Session):
    return db.query(models.Tournament).order_by(models.Tournament.created_at.desc()).all()

def get_public_tournaments(db: Session):
    return db.query(models.Tournament).filter(
        models.Tournament.is_active == True
    ).order_by(models.Tournament.created_at.desc()).all()

def delete_tournament(db: Session, tournament_id: int):
    db_tournament = get_tournament(db, tournament_id)
    if not db_tournament:
        return None

    db.query(models.TournamentMatch).filter(models.TournamentMatch.tournament_id == tournament_id).delete()
    db.query(models.TournamentTeam).filter(models.TournamentTeam.tournament_id == tournament_id).delete()
    db.delete(db_tournament)
    db.commit()
    return db_tournament

def register_team_in_tournament(db: Session, tournament_id: int, team_id: int, group_name: str = None):
    existing = db.query(models.TournamentTeam).filter(
        models.TournamentTeam.tournament_id == tournament_id,
        models.TournamentTeam.team_id == team_id
    ).first()
    if existing:
        return None

    db_item = models.TournamentTeam(
        tournament_id=tournament_id,
        team_id=team_id,
        group_name=(group_name or "").strip() or None,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_tournament_teams(db: Session, tournament_id: int):
    return db.query(models.TournamentTeam).filter(
        models.TournamentTeam.tournament_id == tournament_id
    ).order_by(models.TournamentTeam.created_at.asc()).all()

def create_tournament_match(db: Session, tournament_id: int, match: schemas.TournamentMatchCreate):
    db_match = models.TournamentMatch(
        tournament_id=tournament_id,
        home_team_id=match.home_team_id,
        away_team_id=match.away_team_id,
        match_time=match.match_time,
        location=(match.location or "").strip() or None,
        round_name=(match.round_name or "").strip() or None,
        notes=(match.notes or "").strip() or None,
        status="scheduled",
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

def get_match(db: Session, match_id: int):
    return db.query(models.TournamentMatch).filter(models.TournamentMatch.id == match_id).first()

def get_tournament_matches(db: Session, tournament_id: int):
    return db.query(models.TournamentMatch).filter(
        models.TournamentMatch.tournament_id == tournament_id
    ).order_by(models.TournamentMatch.match_time.asc()).all()

def update_match_result(db: Session, match_id: int, result: schemas.MatchResultUpdate):
    db_match = get_match(db, match_id)
    if not db_match:
        return None
    db_match.home_score = result.home_score
    db_match.away_score = result.away_score
    db_match.status = result.status
    db_match.notes = (result.notes or "").strip() or db_match.notes
    db.commit()
    db.refresh(db_match)
    return db_match

def delete_match(db: Session, match_id: int):
    db_match = get_match(db, match_id)
    if not db_match:
        return None
    db.delete(db_match)
    db.commit()
    return db_match

def to_tournament_team_response(db: Session, item: models.TournamentTeam):
    team = get_team(db, item.team_id)
    return schemas.TournamentTeamResponse(
        id=item.id,
        tournament_id=item.tournament_id,
        team_id=item.team_id,
        team_name=team.name if team else f"Team #{item.team_id}",
        group_name=item.group_name,
        created_at=item.created_at,
    )

def to_tournament_match_response(db: Session, item: models.TournamentMatch):
    home = get_team(db, item.home_team_id)
    away = get_team(db, item.away_team_id)
    return schemas.TournamentMatch(
        id=item.id,
        tournament_id=item.tournament_id,
        home_team_id=item.home_team_id,
        away_team_id=item.away_team_id,
        home_team_name=home.name if home else f"Team #{item.home_team_id}",
        away_team_name=away.name if away else f"Team #{item.away_team_id}",
        match_time=item.match_time,
        location=item.location,
        round_name=item.round_name,
        status=item.status,
        home_score=item.home_score,
        away_score=item.away_score,
        notes=item.notes,
        created_at=item.created_at,
    )

def get_tournament_standings(db: Session, tournament_id: int):
    registrations = get_tournament_teams(db, tournament_id)
    matches = get_tournament_matches(db, tournament_id)

    table: Dict[int, Dict] = {}
    for reg in registrations:
        team = get_team(db, reg.team_id)
        table[reg.team_id] = {
            "team_id": reg.team_id,
            "team_name": team.name if team else f"Team #{reg.team_id}",
            "played": 0,
            "won": 0,
            "draw": 0,
            "lost": 0,
            "goals_for": 0,
            "goals_against": 0,
            "goal_diff": 0,
            "points": 0,
        }

    for m in matches:
        if m.status != "finished" or m.home_score is None or m.away_score is None:
            continue
        if m.home_team_id not in table or m.away_team_id not in table:
            continue

        home = table[m.home_team_id]
        away = table[m.away_team_id]

        home["played"] += 1
        away["played"] += 1
        home["goals_for"] += m.home_score
        home["goals_against"] += m.away_score
        away["goals_for"] += m.away_score
        away["goals_against"] += m.home_score

        if m.home_score > m.away_score:
            home["won"] += 1
            away["lost"] += 1
            home["points"] += 3
        elif m.home_score < m.away_score:
            away["won"] += 1
            home["lost"] += 1
            away["points"] += 3
        else:
            home["draw"] += 1
            away["draw"] += 1
            home["points"] += 1
            away["points"] += 1

    rows: List[schemas.StandingRow] = []
    for row in table.values():
        row["goal_diff"] = row["goals_for"] - row["goals_against"]
        rows.append(schemas.StandingRow(**row))

    rows.sort(key=lambda x: (x.points, x.goal_diff, x.goals_for), reverse=True)
    return rows

def create_tournament_registration_request(
    db: Session,
    tournament_id: int,
    user_id: int,
    payload: schemas.TournamentRegistrationRequestCreate
):
    db_item = models.TournamentRegistrationRequest(
        tournament_id=tournament_id,
        user_id=user_id,
        team_name=payload.team_name.strip(),
        coach_name=(payload.coach_name or "").strip() or None,
        contact_phone=(payload.contact_phone or "").strip() or None,
        players_notes=(payload.players_notes or "").strip() or None,
        status="pending",
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_registration_request(db: Session, request_id: int):
    return db.query(models.TournamentRegistrationRequest).filter(
        models.TournamentRegistrationRequest.id == request_id
    ).first()

def get_registration_requests_for_user(db: Session, user_id: int):
    return db.query(models.TournamentRegistrationRequest).filter(
        models.TournamentRegistrationRequest.user_id == user_id
    ).order_by(models.TournamentRegistrationRequest.created_at.desc()).all()

def get_registration_requests_for_admin(db: Session, status_filter: str = None):
    query = db.query(models.TournamentRegistrationRequest)
    if status_filter:
        query = query.filter(models.TournamentRegistrationRequest.status == status_filter)
    return query.order_by(models.TournamentRegistrationRequest.created_at.desc()).all()

def to_registration_request_response(db: Session, item: models.TournamentRegistrationRequest):
    user = get_user(db, item.user_id)
    tournament = get_tournament(db, item.tournament_id)
    return schemas.TournamentRegistrationRequestResponse(
        id=item.id,
        tournament_id=item.tournament_id,
        tournament_title=tournament.title if tournament else None,
        user_id=item.user_id,
        username=user.username if user else None,
        team_name=item.team_name,
        coach_name=item.coach_name,
        contact_phone=item.contact_phone,
        players_notes=item.players_notes,
        status=item.status,
        admin_notes=item.admin_notes,
        approved_team_id=item.approved_team_id,
        created_at=item.created_at,
        processed_at=item.processed_at,
    )

def approve_registration_request(db: Session, request_id: int, admin_notes: str = None):
    item = get_registration_request(db, request_id)
    if not item:
        return None
    if item.status != "pending":
        return item

    db_team = create_team(
        db,
        schemas.TeamCreate(
            name=item.team_name,
            coach_name=item.coach_name,
            contact_phone=item.contact_phone,
        ),
    )
    reg_item = register_team_in_tournament(db, item.tournament_id, db_team.id, group_name=None)

    item.status = "approved"
    item.admin_notes = (admin_notes or "").strip() or None
    item.approved_team_id = db_team.id
    item.processed_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return item

def reject_registration_request(db: Session, request_id: int, admin_notes: str = None):
    item = get_registration_request(db, request_id)
    if not item:
        return None
    item.status = "rejected"
    item.admin_notes = (admin_notes or "").strip() or None
    item.processed_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return item
