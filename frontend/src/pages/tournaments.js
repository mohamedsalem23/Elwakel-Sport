import { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import Navbar from '@/components/Navbar';
import DynamicBackground from '@/components/DynamicBackground';
import {
  fetchPublicTournaments,
  fetchPublicTournamentDetails,
  fetchTournamentsVisibility,
  fetchUser,
  createTournamentRegistrationRequest,
  fetchMyTournamentRegistrationRequests,
} from '@/api';
import { useLanguage } from '@/context/LanguageContext';
import styles from '@/styles/Tournaments.module.css';

export default function TournamentsPage() {
  const { t, lang } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [details, setDetails] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [registrationForm, setRegistrationForm] = useState({
    team_name: '',
    coach_name: '',
    contact_phone: '',
    players_notes: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const { data: v } = await fetchTournamentsVisibility();
        setVisible(v.show_tournaments_page);
        if (!v.show_tournaments_page) return;

        const { data: list } = await fetchPublicTournaments();
        setTournaments(list);
        if (list.length > 0) {
          const id = list[0].id;
          setSelectedTournamentId(id);
        }

        const token = Cookies.get('token');
        if (token) {
          try {
            const [{ data: me }, { data: reqs }] = await Promise.all([
              fetchUser(),
              fetchMyTournamentRegistrationRequests(),
            ]);
            setCurrentUser(me);
            setMyRequests(reqs);
          } catch (e) {
            setCurrentUser(null);
          }
        }
      } catch (err) {
        setError(err.response?.data?.detail || t('failedToLoadTournaments'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [t]);

  useEffect(() => {
    if (!selectedTournamentId || !visible) return;
    const loadDetails = async () => {
      try {
        setError('');
        const { data } = await fetchPublicTournamentDetails(selectedTournamentId);
        setDetails(data);
      } catch (err) {
        setError(err.response?.data?.detail || t('failedToLoadTournamentDetails'));
      }
    };
    loadDetails();
  }, [selectedTournamentId, visible, t]);

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

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    if (!selectedTournamentId) return;
    try {
      setError('');
      await createTournamentRegistrationRequest(selectedTournamentId, {
        ...registrationForm,
      });
      setRegistrationForm({
        team_name: '',
        coach_name: '',
        contact_phone: '',
        players_notes: '',
      });
      const { data: reqs } = await fetchMyTournamentRegistrationRequests();
      setMyRequests(reqs);
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToLoadTournaments'));
    }
  };

  return (
    <div className={styles.page}>
      <DynamicBackground />
      <Navbar />
      <main className={styles.container}>
        <section className={styles.header}>
          <h1 className={styles.title}>{t('tournaments')}</h1>
          <p className={styles.subtitle}>{t('tournamentsAndEvents')}</p>
        </section>

        {loading && <div className={styles.card}><p className={styles.info}>{t('loadingTournaments')}</p></div>}
        {!loading && error && <div className={styles.error}>{error}</div>}

        {!loading && !error && !visible && (
          <div className={styles.card}><p className={styles.info}>{t('tournamentsPageHidden')}</p></div>
        )}

        {!loading && !error && visible && tournaments.length === 0 && (
          <div className={styles.card}><p className={styles.info}>{t('noTournamentsYet')}</p></div>
        )}

        {!loading && !error && visible && tournaments.length > 0 && (
          <>
            <section className={styles.card}>
              <label className={styles.info}>{t('allTournaments')}</label>
              <select
                className={styles.select}
                value={selectedTournamentId || ''}
                onChange={(e) => setSelectedTournamentId(Number(e.target.value))}
              >
                {tournaments.map((tr) => (
                  <option key={tr.id} value={tr.id}>{tr.title}</option>
                ))}
              </select>
            </section>

            {details && (
              <>
                <section className={styles.card}>
                  <h2 className={styles.title}>{details.tournament.title}</h2>
                  {details.tournament.description && <p className={styles.info}>{details.tournament.description}</p>}
                  <p className={styles.info}>{t('tournamentStatus')}: {details.tournament.status}</p>
                </section>

                <section className={styles.row}>
                  <div className={styles.card}>
                    <h3 className={styles.title}>{t('tournamentTeams')} ({details.teams.length})</h3>
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>{t('teamName')}</th>
                            <th>{t('group')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {details.teams.map((team) => (
                            <tr key={team.id}>
                              <td>{team.team_name}</td>
                              <td>{team.group_name || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className={styles.card}>
                    <h3 className={styles.title}>{t('standings')}</h3>
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
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
                          {details.standings.map((row) => (
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
                  </div>
                </section>

                <section className={styles.card}>
                  <h3 className={styles.title}>{t('matchSchedule')}</h3>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>{t('homeTeam')}</th>
                          <th>{t('awayTeam')}</th>
                          <th>{t('matchTime')}</th>
                          <th>{t('matchResult')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.matches.map((match) => (
                          <tr key={match.id}>
                            <td>{match.home_team_name}</td>
                            <td>{match.away_team_name}</td>
                            <td>{formatDate(match.match_time)}</td>
                            <td>{match.home_score == null ? '-' : `${match.home_score} - ${match.away_score}`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {currentUser && (
                  <>
                    <section className={styles.card}>
                      <h3 className={styles.title}>{t('registerYourTeam')}</h3>
                      <form onSubmit={handleSubmitRegistration} style={{ display: 'grid', gap: '0.7rem' }}>
                        <input
                          className={styles.select}
                          placeholder={t('teamName')}
                          value={registrationForm.team_name}
                          onChange={(e) => setRegistrationForm({ ...registrationForm, team_name: e.target.value })}
                          required
                        />
                        <div className={styles.row}>
                          <input
                            className={styles.select}
                            placeholder={t('coachName')}
                            value={registrationForm.coach_name}
                            onChange={(e) => setRegistrationForm({ ...registrationForm, coach_name: e.target.value })}
                          />
                          <input
                            className={styles.select}
                            placeholder={t('contactPhone')}
                            value={registrationForm.contact_phone}
                            onChange={(e) => setRegistrationForm({ ...registrationForm, contact_phone: e.target.value })}
                          />
                        </div>
                        <textarea
                          className={styles.select}
                          placeholder={t('playersNotes')}
                          value={registrationForm.players_notes}
                          onChange={(e) => setRegistrationForm({ ...registrationForm, players_notes: e.target.value })}
                          rows={3}
                        />
                        <button className={styles.select} type="submit">{t('submitRegistrationRequest')}</button>
                      </form>
                    </section>

                    <section className={styles.card}>
                      <h3 className={styles.title}>{t('myRegistrationRequests')}</h3>
                      <div className={styles.tableWrap}>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>{t('tournamentTitle')}</th>
                              <th>{t('teamName')}</th>
                              <th>{t('status')}</th>
                              <th>{t('adminNotes')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {myRequests.map((req) => (
                              <tr key={req.id}>
                                <td>{req.tournament_title || '-'}</td>
                                <td>{req.team_name}</td>
                                <td>{t(req.status)}</td>
                                <td>{req.admin_notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
