from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend import crud, schemas, models, auth, database

router = APIRouter(tags=["tournaments"])

@router.get("/tournaments/visibility", response_model=schemas.TournamentsVisibilityResponse)
def get_tournaments_visibility(db: Session = Depends(database.get_db)):
    return {"show_tournaments_page": crud.get_tournaments_visibility(db)}

@router.get("/tournaments", response_model=List[schemas.Tournament])
def get_public_tournaments(db: Session = Depends(database.get_db)):
    if not crud.get_tournaments_visibility(db):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournaments page is currently hidden")
    return crud.get_public_tournaments(db)

@router.get("/tournaments/{tournament_id}", response_model=schemas.TournamentDetails)
def get_public_tournament_details(tournament_id: int, db: Session = Depends(database.get_db)):
    if not crud.get_tournaments_visibility(db):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournaments page is currently hidden")
    tournament = crud.get_tournament(db, tournament_id)
    if not tournament or not tournament.is_active:
        raise HTTPException(status_code=404, detail="Tournament not found")

    teams = [crud.to_tournament_team_response(db, x) for x in crud.get_tournament_teams(db, tournament_id)]
    matches = [crud.to_tournament_match_response(db, x) for x in crud.get_tournament_matches(db, tournament_id)]
    standings = crud.get_tournament_standings(db, tournament_id)

    return schemas.TournamentDetails(
        tournament=tournament,
        teams=teams,
        matches=matches,
        standings=standings,
    )

@router.put("/admin/tournaments/visibility", response_model=schemas.TournamentsVisibilityResponse)
def update_tournaments_visibility_admin(
    payload: schemas.TournamentsVisibilityUpdate,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    settings = crud.update_tournaments_visibility(db, payload.show_tournaments_page)
    return {"show_tournaments_page": settings.show_tournaments_page}

@router.get("/admin/teams", response_model=List[schemas.Team])
def get_teams_admin(
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    return crud.get_teams(db)

@router.post("/admin/teams", response_model=schemas.Team)
def create_team_admin(
    team: schemas.TeamCreate,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    if not team.name.strip():
        raise HTTPException(status_code=400, detail="Team name is required")
    return crud.create_team(db, team)

@router.post("/admin/teams/{team_id}/players", response_model=schemas.TeamPlayer)
def add_team_player_admin(
    team_id: int,
    player: schemas.TeamPlayerCreate,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    db_team = crud.get_team(db, team_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    if not player.name.strip():
        raise HTTPException(status_code=400, detail="Player name is required")
    return crud.add_player_to_team(db, team_id, player)

@router.get("/admin/tournaments", response_model=List[schemas.Tournament])
def get_tournaments_admin(
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    return crud.get_tournaments(db)

@router.post("/admin/tournaments", response_model=schemas.Tournament)
def create_tournament_admin(
    tournament: schemas.TournamentCreate,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    if not tournament.title.strip():
        raise HTTPException(status_code=400, detail="Tournament title is required")
    if tournament.start_date and tournament.end_date and tournament.end_date < tournament.start_date:
        raise HTTPException(status_code=400, detail="Tournament end date must be after start date")
    return crud.create_tournament(db, tournament)

@router.delete("/admin/tournaments/{tournament_id}", response_model=schemas.Tournament)
def delete_tournament_admin(
    tournament_id: int,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    db_tournament = crud.delete_tournament(db, tournament_id)
    if not db_tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return db_tournament

@router.post("/admin/tournaments/{tournament_id}/teams/register", response_model=schemas.TournamentTeamResponse)
def register_team_in_tournament_admin(
    tournament_id: int,
    payload: schemas.TournamentTeamRegisterRequest,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    db_tournament = crud.get_tournament(db, tournament_id)
    if not db_tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    db_team = crud.get_team(db, payload.team_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")

    item = crud.register_team_in_tournament(db, tournament_id, payload.team_id, payload.group_name)
    if not item:
        raise HTTPException(status_code=400, detail="Team already registered in this tournament")
    return crud.to_tournament_team_response(db, item)

@router.get("/admin/tournaments/{tournament_id}/teams", response_model=List[schemas.TournamentTeamResponse])
def get_tournament_teams_admin(
    tournament_id: int,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    db_tournament = crud.get_tournament(db, tournament_id)
    if not db_tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return [crud.to_tournament_team_response(db, x) for x in crud.get_tournament_teams(db, tournament_id)]

@router.post("/admin/tournaments/{tournament_id}/matches", response_model=schemas.TournamentMatch)
def create_tournament_match_admin(
    tournament_id: int,
    payload: schemas.TournamentMatchCreate,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    if payload.home_team_id == payload.away_team_id:
        raise HTTPException(status_code=400, detail="Home and away teams must be different")

    db_tournament = crud.get_tournament(db, tournament_id)
    if not db_tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    tournament_team_ids = {x.team_id for x in crud.get_tournament_teams(db, tournament_id)}
    if payload.home_team_id not in tournament_team_ids or payload.away_team_id not in tournament_team_ids:
        raise HTTPException(status_code=400, detail="Both teams must be registered in this tournament")

    db_match = crud.create_tournament_match(db, tournament_id, payload)
    return crud.to_tournament_match_response(db, db_match)

@router.get("/admin/tournaments/{tournament_id}/matches", response_model=List[schemas.TournamentMatch])
def get_tournament_matches_admin(
    tournament_id: int,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    db_tournament = crud.get_tournament(db, tournament_id)
    if not db_tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return [crud.to_tournament_match_response(db, x) for x in crud.get_tournament_matches(db, tournament_id)]

@router.put("/admin/matches/{match_id}/result", response_model=schemas.TournamentMatch)
def update_match_result_admin(
    match_id: int,
    payload: schemas.MatchResultUpdate,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    if payload.home_score < 0 or payload.away_score < 0:
        raise HTTPException(status_code=400, detail="Scores cannot be negative")
    db_match = crud.update_match_result(db, match_id, payload)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    return crud.to_tournament_match_response(db, db_match)

@router.delete("/admin/matches/{match_id}", response_model=schemas.TournamentMatch)
def delete_match_admin(
    match_id: int,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    db_match = crud.delete_match(db, match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    return crud.to_tournament_match_response(db, db_match)

@router.get("/tournaments/{tournament_id}/standings", response_model=List[schemas.StandingRow])
def get_public_tournament_standings(tournament_id: int, db: Session = Depends(database.get_db)):
    if not crud.get_tournaments_visibility(db):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tournaments page is currently hidden")
    db_tournament = crud.get_tournament(db, tournament_id)
    if not db_tournament or not db_tournament.is_active:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return crud.get_tournament_standings(db, tournament_id)

@router.post("/tournaments/{tournament_id}/registration-requests", response_model=schemas.TournamentRegistrationRequestResponse)
def create_registration_request_user(
    tournament_id: int,
    payload: schemas.TournamentRegistrationRequestCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    db_tournament = crud.get_tournament(db, tournament_id)
    if not db_tournament or not db_tournament.is_active:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if not payload.team_name.strip():
        raise HTTPException(status_code=400, detail="Team name is required")

    item = crud.create_tournament_registration_request(db, tournament_id, current_user.id, payload)
    return crud.to_registration_request_response(db, item)

@router.get("/tournaments/my/registration-requests", response_model=List[schemas.TournamentRegistrationRequestResponse])
def get_my_registration_requests(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    items = crud.get_registration_requests_for_user(db, current_user.id)
    return [crud.to_registration_request_response(db, x) for x in items]

@router.get("/admin/tournaments/{tournament_id}/standings", response_model=List[schemas.StandingRow])
def get_tournament_standings_admin(
    tournament_id: int,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    db_tournament = crud.get_tournament(db, tournament_id)
    if not db_tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return crud.get_tournament_standings(db, tournament_id)

@router.get("/admin/tournaments/registration-requests", response_model=List[schemas.TournamentRegistrationRequestResponse])
def get_registration_requests_admin(
    status_filter: str = None,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    items = crud.get_registration_requests_for_admin(db, status_filter=status_filter)
    return [crud.to_registration_request_response(db, x) for x in items]

@router.put("/admin/tournaments/registration-requests/{request_id}/approve", response_model=schemas.TournamentRegistrationRequestResponse)
def approve_registration_request_admin(
    request_id: int,
    payload: schemas.TournamentRegistrationDecisionRequest,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    item = crud.approve_registration_request(db, request_id, admin_notes=payload.admin_notes)
    if not item:
        raise HTTPException(status_code=404, detail="Registration request not found")
    return crud.to_registration_request_response(db, item)

@router.put("/admin/tournaments/registration-requests/{request_id}/reject", response_model=schemas.TournamentRegistrationRequestResponse)
def reject_registration_request_admin(
    request_id: int,
    payload: schemas.TournamentRegistrationDecisionRequest,
    db: Session = Depends(database.get_db),
    _: models.User = Depends(auth.get_current_admin_user),
):
    item = crud.reject_registration_request(db, request_id, admin_notes=payload.admin_notes)
    if not item:
        raise HTTPException(status_code=404, detail="Registration request not found")
    return crud.to_registration_request_response(db, item)
