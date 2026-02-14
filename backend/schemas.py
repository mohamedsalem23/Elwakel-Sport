from typing import List, Optional
from pydantic import BaseModel, field_validator
from datetime import datetime
import re

class BookingBase(BaseModel):
    start_time: datetime
    end_time: datetime

class BookingCreate(BookingBase):
    booker_name: Optional[str] = None
    booker_phone: Optional[str] = None

class Booking(BookingBase):
    id: int
    user_id: int
    booker_name: Optional[str] = None
    booker_phone: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: str
    phone_number: Optional[str] = None

    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        if not v or len(v) > 100:
            raise ValueError('Username must be 1-100 characters')
        return v

    @field_validator('phone_number')
    @classmethod
    def validate_phone(cls, v):
        if v is None:
            return v
        # Remove spaces and hyphens
        v = v.replace(' ', '').replace('-', '')
        # Check if it's exactly 11 digits and starts with Egyptian prefix
        if not re.match(r'^(010|011|012|015)\d{8}$', v):
            raise ValueError('Phone number must be Egyptian (010, 011, 012, or 015) followed by 8 digits')
        return v

class UserCreate(UserBase):
    password: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        # Check for at least one letter and one digit
        has_letter = any(c.isalpha() for c in v)
        has_digit = any(c.isdigit() for c in v)
        if not (has_letter and has_digit):
            raise ValueError('Password must contain both letters and numbers')
        return v

class CompleteGoogleProfileRequest(BaseModel):
    phone_number: str
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    bookings: List[Booking] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: datetime
    end_time: datetime

class EventCreate(EventBase):
    is_active: bool = True

class Event(EventBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class EventsVisibilityUpdate(BaseModel):
    show_events_page: bool

class EventsVisibilityResponse(BaseModel):
    show_events_page: bool

class TournamentsVisibilityUpdate(BaseModel):
    show_tournaments_page: bool

class TournamentsVisibilityResponse(BaseModel):
    show_tournaments_page: bool

class TeamPlayerBase(BaseModel):
    name: str
    jersey_number: Optional[int] = None
    position: Optional[str] = None

class TeamPlayerCreate(TeamPlayerBase):
    pass

class TeamPlayer(TeamPlayerBase):
    id: int
    team_id: int

    class Config:
        from_attributes = True

class TeamBase(BaseModel):
    name: str
    coach_name: Optional[str] = None
    contact_phone: Optional[str] = None

class TeamCreate(TeamBase):
    pass

class Team(TeamBase):
    id: int
    created_at: datetime
    players: List[TeamPlayer] = []

    class Config:
        from_attributes = True

class TournamentBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: str = "upcoming"
    is_active: bool = True

class TournamentCreate(TournamentBase):
    pass

class Tournament(TournamentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TournamentTeamRegisterRequest(BaseModel):
    team_id: int
    group_name: Optional[str] = None

class TournamentTeamResponse(BaseModel):
    id: int
    tournament_id: int
    team_id: int
    team_name: str
    group_name: Optional[str] = None
    created_at: datetime

class TournamentMatchCreate(BaseModel):
    home_team_id: int
    away_team_id: int
    match_time: datetime
    location: Optional[str] = None
    round_name: Optional[str] = None
    notes: Optional[str] = None

class MatchResultUpdate(BaseModel):
    home_score: int
    away_score: int
    status: str = "finished"
    notes: Optional[str] = None

class TournamentMatch(BaseModel):
    id: int
    tournament_id: int
    home_team_id: int
    away_team_id: int
    home_team_name: str
    away_team_name: str
    match_time: datetime
    location: Optional[str] = None
    round_name: Optional[str] = None
    status: str
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime

class StandingRow(BaseModel):
    team_id: int
    team_name: str
    played: int
    won: int
    draw: int
    lost: int
    goals_for: int
    goals_against: int
    goal_diff: int
    points: int

class TournamentDetails(BaseModel):
    tournament: Tournament
    teams: List[TournamentTeamResponse]
    matches: List[TournamentMatch]
    standings: List[StandingRow]

class TournamentRegistrationRequestCreate(BaseModel):
    team_name: str
    coach_name: Optional[str] = None
    contact_phone: Optional[str] = None
    players_notes: Optional[str] = None

class TournamentRegistrationRequestResponse(BaseModel):
    id: int
    tournament_id: int
    tournament_title: Optional[str] = None
    user_id: int
    username: Optional[str] = None
    team_name: str
    coach_name: Optional[str] = None
    contact_phone: Optional[str] = None
    players_notes: Optional[str] = None
    status: str
    admin_notes: Optional[str] = None
    approved_team_id: Optional[int] = None
    created_at: datetime
    processed_at: Optional[datetime] = None

class TournamentRegistrationDecisionRequest(BaseModel):
    admin_notes: Optional[str] = None
