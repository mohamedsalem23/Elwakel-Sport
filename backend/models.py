from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    phone_number = Column(String, nullable=True)
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)

    bookings = relationship("Booking", back_populates="owner")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    booker_name = Column(String, nullable=True)
    booker_phone = Column(String, nullable=True)
    start_time = Column(DateTime, index=True)
    end_time = Column(DateTime, index=True)
    status = Column(String, default="confirmed") # confirmed, cancelled
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="bookings")

class SiteSetting(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)
    show_events_page = Column(Boolean, default=False, nullable=False)
    show_tournaments_page = Column(Boolean, default=False, nullable=False)

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    location = Column(String, nullable=True)
    start_time = Column(DateTime, index=True, nullable=False)
    end_time = Column(DateTime, index=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    coach_name = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    players = relationship("TeamPlayer", back_populates="team", cascade="all, delete-orphan")

class TeamPlayer(Base):
    __tablename__ = "team_players"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    jersey_number = Column(Integer, nullable=True)
    position = Column(String, nullable=True)

    team = relationship("Team", back_populates="players")

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    status = Column(String, default="upcoming", nullable=False)  # upcoming, ongoing, completed
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TournamentTeam(Base):
    __tablename__ = "tournament_teams"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    group_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TournamentMatch(Base):
    __tablename__ = "tournament_matches"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False, index=True)
    home_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    away_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    match_time = Column(DateTime, nullable=False, index=True)
    location = Column(String, nullable=True)
    round_name = Column(String, nullable=True)
    status = Column(String, default="scheduled", nullable=False)  # scheduled, finished, cancelled
    home_score = Column(Integer, nullable=True)
    away_score = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TournamentRegistrationRequest(Base):
    __tablename__ = "tournament_registration_requests"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    team_name = Column(String, nullable=False, index=True)
    coach_name = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    players_notes = Column(String, nullable=True)
    status = Column(String, default="pending", nullable=False)  # pending, approved, rejected
    admin_notes = Column(String, nullable=True)
    approved_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)
