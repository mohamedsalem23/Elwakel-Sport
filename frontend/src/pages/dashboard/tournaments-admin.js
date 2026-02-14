import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Navbar from '@/components/Navbar';
import {
  fetchUser,
  fetchTournamentsVisibility,
  setTournamentsVisibility,
  fetchAdminTournaments,
  createAdminTournament,
  deleteAdminTournament,
  fetchAdminTeams,
  createAdminTeam,
  addAdminTeamPlayer,
  registerTeamInTournament,
  fetchTournamentTeamsAdmin,
  createTournamentMatchAdmin,
  fetchTournamentMatchesAdmin,
  updateMatchResultAdmin,
  deleteMatchAdmin,
  fetchTournamentStandingsAdmin,
  fetchTournamentRegistrationRequestsAdmin,
  approveTournamentRegistrationRequestAdmin,
  rejectTournamentRegistrationRequestAdmin,
} from '@/api';
import { useLanguage } from '@/context/LanguageContext';
import styles from '@/styles/Dashboard.module.css';

export default function TournamentsAdminPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showPage, setShowPage] = useState(false);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [registrationRequests, setRegistrationRequests] = useState([]);

  const [tournamentForm, setTournamentForm] = useState({
    title: '',
    description: '',
    status: 'upcoming',
    start_date: '',
    end_date: '',
    is_active: true,
  });
  const [teamForm, setTeamForm] = useState({
    name: '',
    coach_name: '',
    contact_phone: '',
  });
  const [playerForm, setPlayerForm] = useState({
    team_id: '',
    name: '',
    jersey_number: '',
    position: '',
  });
  const [registerForm, setRegisterForm] = useState({
    team_id: '',
    group_name: '',
  });
  const [matchForm, setMatchForm] = useState({
    home_team_id: '',
    away_team_id: '',
    match_time: '',
    location: '',
    round_name: '',
    notes: '',
  });
  const [resultForms, setResultForms] = useState({});

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    loadData();
  }, []);

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 2500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const { data: me } = await fetchUser();
      if (!me.is_admin) {
        router.replace('/dashboard/user');
        return;
      }
      const [{ data: visibility }, { data: teamsData }, { data: tournamentsData }] = await Promise.all([
        fetchTournamentsVisibility(),
        fetchAdminTeams(),
        fetchAdminTournaments(),
      ]);
      setShowPage(visibility.show_tournaments_page);
      setTeams(teamsData);
      setTournaments(tournamentsData);
      if (tournamentsData.length > 0) {
        const id = tournamentsData[0].id;
        setSelectedTournamentId(id);
      }
      const { data: requestsData } = await fetchTournamentRegistrationRequestsAdmin('pending');
      setRegistrationRequests(requestsData);
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToLoadTournamentsAdminData'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedTournamentId) return;
    const loadTournamentData = async () => {
      try {
        const [{ data: teamsData }, { data: matchesData }, { data: standingsData }] = await Promise.all([
          fetchTournamentTeamsAdmin(selectedTournamentId),
          fetchTournamentMatchesAdmin(selectedTournamentId),
          fetchTournamentStandingsAdmin(selectedTournamentId),
        ]);
        setRegisteredTeams(teamsData);
        setMatches(matchesData);
        setStandings(standingsData);
      } catch (err) {
        setError(err.response?.data?.detail || t('failedToLoadTournamentDetails'));
      }
    };
    loadTournamentData();
  }, [selectedTournamentId, t]);

  const formatDate = useMemo(
    () => (value) =>
      new Date(value).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [lang]
  );

  const refreshTournamentData = async () => {
    if (!selectedTournamentId) return;
    const [{ data: teamsData }, { data: matchesData }, { data: standingsData }] = await Promise.all([
      fetchTournamentTeamsAdmin(selectedTournamentId),
      fetchTournamentMatchesAdmin(selectedTournamentId),
      fetchTournamentStandingsAdmin(selectedTournamentId),
    ]);
    setRegisteredTeams(teamsData);
    setMatches(matchesData);
    setStandings(standingsData);
  };

  const handleVisibilityToggle = async () => {
    try {
      setSaving(true);
      const next = !showPage;
      await setTournamentsVisibility(next);
      setShowPage(next);
      showSuccess(next ? t('tournamentsPageVisible') : t('tournamentsPageNowHidden'));
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToUpdateVisibility'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createAdminTournament({
        ...tournamentForm,
        start_date: tournamentForm.start_date || null,
        end_date: tournamentForm.end_date || null,
      });
      setTournamentForm({ title: '', description: '', status: 'upcoming', start_date: '', end_date: '', is_active: true });
      const { data } = await fetchAdminTournaments();
      setTournaments(data);
      showSuccess(t('tournamentCreatedSuccessfully'));
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToCreateTournament'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTournament = async (id) => {
    if (!window.confirm(t('deleteTournamentConfirm'))) return;
    try {
      setSaving(true);
      await deleteAdminTournament(id);
      const { data } = await fetchAdminTournaments();
      setTournaments(data);
      if (selectedTournamentId === id) {
        setSelectedTournamentId(data.length ? data[0].id : null);
      }
      showSuccess(t('tournamentDeletedSuccessfully'));
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToDeleteTournament'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createAdminTeam(teamForm);
      setTeamForm({ name: '', coach_name: '', contact_phone: '' });
      const { data } = await fetchAdminTeams();
      setTeams(data);
      showSuccess(t('teamCreatedSuccessfully'));
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToCreateTeam'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await addAdminTeamPlayer(Number(playerForm.team_id), {
        name: playerForm.name,
        jersey_number: playerForm.jersey_number ? Number(playerForm.jersey_number) : null,
        position: playerForm.position || null,
      });
      setPlayerForm({ team_id: '', name: '', jersey_number: '', position: '' });
      const { data } = await fetchAdminTeams();
      setTeams(data);
      showSuccess(t('playerAddedSuccessfully'));
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToAddPlayer'));
    } finally {
      setSaving(false);
    }
  };

  const handleRegisterTeam = async (e) => {
    e.preventDefault();
    if (!selectedTournamentId) return;
    try {
      setSaving(true);
      await registerTeamInTournament(selectedTournamentId, {
        team_id: Number(registerForm.team_id),
        group_name: registerForm.group_name || null,
      });
      setRegisterForm({ team_id: '', group_name: '' });
      await refreshTournamentData();
      showSuccess(t('teamRegistered'));
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToRegisterTeam'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (!selectedTournamentId) return;
    try {
      setSaving(true);
      await createTournamentMatchAdmin(selectedTournamentId, {
        home_team_id: Number(matchForm.home_team_id),
        away_team_id: Number(matchForm.away_team_id),
        match_time: matchForm.match_time,
        location: matchForm.location || null,
        round_name: matchForm.round_name || null,
        notes: matchForm.notes || null,
      });
      setMatchForm({
        home_team_id: '',
        away_team_id: '',
        match_time: '',
        location: '',
        round_name: '',
        notes: '',
      });
      await refreshTournamentData();
      showSuccess(t('matchCreatedSuccessfully'));
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToCreateMatch'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateResult = async (matchId) => {
    const form = resultForms[matchId];
    if (!form) return;
    try {
      setSaving(true);
      await updateMatchResultAdmin(matchId, {
        home_score: Number(form.home_score),
        away_score: Number(form.away_score),
        status: 'finished',
      });
      await refreshTournamentData();
      showSuccess(t('resultUpdatedSuccessfully'));
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToUpdateMatchResult'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm(t('deleteMatchConfirm'))) return;
    try {
      setSaving(true);
      await deleteMatchAdmin(matchId);
      await refreshTournamentData();
      showSuccess(t('matchDeletedSuccessfully'));
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToDeleteMatch'));
    } finally {
      setSaving(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setSaving(true);
      await approveTournamentRegistrationRequestAdmin(requestId);
      const { data: requestsData } = await fetchTournamentRegistrationRequestsAdmin('pending');
      setRegistrationRequests(requestsData);
      await refreshTournamentData();
      showSuccess(t('approved'));
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToRegisterTeam'));
    } finally {
      setSaving(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setSaving(true);
      await rejectTournamentRegistrationRequestAdmin(requestId);
      const { data: requestsData } = await fetchTournamentRegistrationRequestsAdmin('pending');
      setRegistrationRequests(requestsData);
      showSuccess(t('rejected'));
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToRegisterTeam'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>{t('loadingTournamentsManagement')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>{t('tournamentsManagement')}</h1>
            <p className={styles.subtitle}>{t('manageTournaments')}</p>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <section className={styles.chartSection} style={{ marginTop: 0 }}>
          <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>{t('pageVisibility')}</h3>
          <button className={styles.filterBtn} onClick={handleVisibilityToggle} disabled={saving}>
            {showPage ? t('hideTournamentsPage') : t('showTournamentsPage')}
          </button>
        </section>

        <section className={styles.chartSection}>
          <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>{t('createTournament')}</h3>
          <form onSubmit={handleCreateTournament} style={{ display: 'grid', gap: '0.75rem' }}>
            <input value={tournamentForm.title} onChange={(e) => setTournamentForm({ ...tournamentForm, title: e.target.value })} placeholder={t('tournamentTitle')} className={styles.filterBtn} />
            <textarea value={tournamentForm.description} onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })} placeholder={t('tournamentDescription')} className={styles.filterBtn} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <select value={tournamentForm.status} onChange={(e) => setTournamentForm({ ...tournamentForm, status: e.target.value })} className={styles.filterBtn}>
                <option value="upcoming">upcoming</option>
                <option value="ongoing">ongoing</option>
                <option value="completed">completed</option>
              </select>
              <input type="datetime-local" value={tournamentForm.start_date} onChange={(e) => setTournamentForm({ ...tournamentForm, start_date: e.target.value })} className={styles.filterBtn} />
              <input type="datetime-local" value={tournamentForm.end_date} onChange={(e) => setTournamentForm({ ...tournamentForm, end_date: e.target.value })} className={styles.filterBtn} />
            </div>
            <button className={styles.filterBtn} type="submit" disabled={saving}>{t('createTournament')}</button>
          </form>
        </section>

        <section className={styles.chartSection}>
          <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>{t('createTeam')}</h3>
          <form onSubmit={handleCreateTeam} style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <input value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} placeholder={t('teamName')} className={styles.filterBtn} />
              <input value={teamForm.coach_name} onChange={(e) => setTeamForm({ ...teamForm, coach_name: e.target.value })} placeholder={t('coachName')} className={styles.filterBtn} />
              <input value={teamForm.contact_phone} onChange={(e) => setTeamForm({ ...teamForm, contact_phone: e.target.value })} placeholder={t('contactPhone')} className={styles.filterBtn} />
            </div>
            <button className={styles.filterBtn} type="submit" disabled={saving}>{t('createTeam')}</button>
          </form>
        </section>

        <section className={styles.chartSection}>
          <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>{t('addPlayer')}</h3>
          <form onSubmit={handleAddPlayer} style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
              <select value={playerForm.team_id} onChange={(e) => setPlayerForm({ ...playerForm, team_id: e.target.value })} className={styles.filterBtn}>
                <option value="">-- {t('teamName')} --</option>
                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
              <input value={playerForm.name} onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })} placeholder={t('playerName')} className={styles.filterBtn} />
              <input value={playerForm.jersey_number} onChange={(e) => setPlayerForm({ ...playerForm, jersey_number: e.target.value })} placeholder={t('jerseyNumber')} className={styles.filterBtn} />
              <input value={playerForm.position} onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })} placeholder={t('position')} className={styles.filterBtn} />
            </div>
            <button className={styles.filterBtn} type="submit" disabled={saving}>{t('addPlayer')}</button>
          </form>
        </section>

        <section className={styles.chartSection}>
          <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>{t('allTournaments')} ({tournaments.length})</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {tournaments.map((tr) => (
              <div key={tr.id} className={styles.statCard} style={{ textAlign: 'left', padding: '1rem' }}>
                <h4 style={{ color: '#e2e8f0', marginTop: 0 }}>{tr.title}</h4>
                <p className={styles.subtitle}>{t('tournamentStatus')}: {tr.status}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className={styles.filterBtn} onClick={() => setSelectedTournamentId(tr.id)}>{t('manageTournaments')}</button>
                  <button className={styles.deleteUserBtn} onClick={() => handleDeleteTournament(tr.id)}>{t('delete')}</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.chartSection}>
          <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>{t('registrationRequests')} ({registrationRequests.length})</h3>
          {registrationRequests.length === 0 ? (
            <p className={styles.subtitle}>{t('noBookings')}</p>
          ) : (
            <div className={styles.bookingsList}>
              {registrationRequests.map((req) => (
                <div key={req.id} className={styles.statCard} style={{ textAlign: 'left', padding: '1rem' }}>
                  <p className={styles.subtitle}><strong>{t('tournamentTitle')}:</strong> {req.tournament_title}</p>
                  <p className={styles.subtitle}><strong>{t('submittedBy')}:</strong> {req.username || `#${req.user_id}`}</p>
                  <p className={styles.subtitle}><strong>{t('teamName')}:</strong> {req.team_name}</p>
                  <p className={styles.subtitle}><strong>{t('coachName')}:</strong> {req.coach_name || '-'}</p>
                  <p className={styles.subtitle}><strong>{t('contactPhone')}:</strong> {req.contact_phone || '-'}</p>
                  <p className={styles.subtitle}><strong>{t('playersNotes')}:</strong> {req.players_notes || '-'}</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={styles.filterBtn} onClick={() => handleApproveRequest(req.id)} disabled={saving}>{t('approve')}</button>
                    <button className={styles.deleteUserBtn} onClick={() => handleRejectRequest(req.id)} disabled={saving}>{t('reject')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {selectedTournamentId && (
          <>
            <section className={styles.chartSection}>
              <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>{t('registerTeam')}</h3>
              <form onSubmit={handleRegisterTeam} style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <select value={registerForm.team_id} onChange={(e) => setRegisterForm({ ...registerForm, team_id: e.target.value })} className={styles.filterBtn}>
                    <option value="">-- {t('teamName')} --</option>
                    {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                  </select>
                  <input value={registerForm.group_name} onChange={(e) => setRegisterForm({ ...registerForm, group_name: e.target.value })} placeholder={t('group')} className={styles.filterBtn} />
                </div>
                <button className={styles.filterBtn} type="submit" disabled={saving}>{t('registerTeam')}</button>
              </form>
            </section>

            <section className={styles.chartSection}>
              <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>{t('createMatch')}</h3>
              <form onSubmit={handleCreateMatch} style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <select value={matchForm.home_team_id} onChange={(e) => setMatchForm({ ...matchForm, home_team_id: e.target.value })} className={styles.filterBtn}>
                    <option value="">-- {t('homeTeam')} --</option>
                    {registeredTeams.map((team) => <option key={team.team_id} value={team.team_id}>{team.team_name}</option>)}
                  </select>
                  <select value={matchForm.away_team_id} onChange={(e) => setMatchForm({ ...matchForm, away_team_id: e.target.value })} className={styles.filterBtn}>
                    <option value="">-- {t('awayTeam')} --</option>
                    {registeredTeams.map((team) => <option key={team.team_id} value={team.team_id}>{team.team_name}</option>)}
                  </select>
                  <input type="datetime-local" value={matchForm.match_time} onChange={(e) => setMatchForm({ ...matchForm, match_time: e.target.value })} className={styles.filterBtn} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input value={matchForm.round_name} onChange={(e) => setMatchForm({ ...matchForm, round_name: e.target.value })} placeholder={t('roundName')} className={styles.filterBtn} />
                  <input value={matchForm.location} onChange={(e) => setMatchForm({ ...matchForm, location: e.target.value })} placeholder={t('location')} className={styles.filterBtn} />
                </div>
                <button className={styles.filterBtn} type="submit" disabled={saving}>{t('createMatch')}</button>
              </form>
            </section>

            <section className={styles.chartSection}>
              <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>{t('matchSchedule')}</h3>
              <div className={styles.bookingsList}>
                {matches.map((m) => (
                  <div key={m.id} className={styles.statCard} style={{ textAlign: 'left', padding: '1rem' }}>
                    <p className={styles.subtitle}><strong>{m.home_team_name}</strong> vs <strong>{m.away_team_name}</strong></p>
                    <p className={styles.subtitle}>{formatDate(m.match_time)}</p>
                    <p className={styles.subtitle}>{t('matchResult')}: {m.home_score == null ? '-' : `${m.home_score} - ${m.away_score}`}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '0.5rem' }}>
                      <input
                        className={styles.filterBtn}
                        placeholder={t('homeScore')}
                        value={resultForms[m.id]?.home_score ?? ''}
                        onChange={(e) => setResultForms({ ...resultForms, [m.id]: { ...(resultForms[m.id] || {}), home_score: e.target.value, away_score: resultForms[m.id]?.away_score ?? '' } })}
                      />
                      <input
                        className={styles.filterBtn}
                        placeholder={t('awayScore')}
                        value={resultForms[m.id]?.away_score ?? ''}
                        onChange={(e) => setResultForms({ ...resultForms, [m.id]: { ...(resultForms[m.id] || {}), away_score: e.target.value, home_score: resultForms[m.id]?.home_score ?? '' } })}
                      />
                      <button className={styles.filterBtn} onClick={() => handleUpdateResult(m.id)}>{t('updateResult')}</button>
                      <button className={styles.deleteUserBtn} onClick={() => handleDeleteMatch(m.id)}>{t('delete')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.chartSection}>
              <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>{t('standings')}</h3>
              <div className={styles.usersTableWrapper}>
                <table className={styles.usersTable}>
                  <thead>
                    <tr>
                      <th>{t('teamName')}</th>
                      <th>{t('played')}</th>
                      <th>{t('won')}</th>
                      <th>{t('draw')}</th>
                      <th>{t('lost')}</th>
                      <th>{t('goalDiff')}</th>
                      <th>{t('points')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row) => (
                      <tr key={row.team_id}>
                        <td>{row.team_name}</td>
                        <td>{row.played}</td>
                        <td>{row.won}</td>
                        <td>{row.draw}</td>
                        <td>{row.lost}</td>
                        <td>{row.goal_diff}</td>
                        <td>{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
