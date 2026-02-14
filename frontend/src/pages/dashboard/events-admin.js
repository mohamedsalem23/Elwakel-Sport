import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';
import {
  fetchUser,
  fetchEventsVisibility,
  setEventsVisibility,
  fetchAdminEvents,
  createAdminEvent,
  deleteAdminEvent,
  toggleAdminEventActive,
} from '@/api';
import styles from '@/styles/Dashboard.module.css';

export default function EventsAdminPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState([]);
  const [showEventsPage, setShowEventsPageState] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    is_active: true,
  });

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: me } = await fetchUser();
      if (!me.is_admin) {
        router.replace('/dashboard/user');
        return;
      }

      const [{ data: visibility }, { data: allEvents }] = await Promise.all([
        fetchEventsVisibility(),
        fetchAdminEvents(),
      ]);

      setShowEventsPageState(visibility.show_events_page);
      setEvents(allEvents);
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToLoadEventsAdminData'));
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 2500);
  };

  const formatDateTime = (dateValue) =>
    new Date(dateValue).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');

  const handleVisibilityChange = async () => {
    try {
      setSaving(true);
      setError('');
      const nextValue = !showEventsPage;
      await setEventsVisibility(nextValue);
      setShowEventsPageState(nextValue);
      showSuccess(nextValue ? t('eventsPageVisible') : t('eventsPageHidden'));
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToUpdateVisibility'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      if (!form.title.trim()) {
        setError(t('titleRequired'));
        return;
      }
      if (!form.start_time || !form.end_time) {
        setError(t('startEndRequired'));
        return;
      }

      await createAdminEvent({
        title: form.title,
        description: form.description,
        location: form.location,
        start_time: form.start_time,
        end_time: form.end_time,
        is_active: form.is_active,
      });

      setForm({
        title: '',
        description: '',
        location: '',
        start_time: '',
        end_time: '',
        is_active: true,
      });

      await loadData();
      showSuccess(t('eventCreatedSuccessfully'));
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToCreateEvent'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm(t('deleteThisEvent'))) return;
    try {
      setSaving(true);
      setError('');
      await deleteAdminEvent(eventId);
      await loadData();
      showSuccess(t('eventDeleted'));
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToDeleteEvent'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEventActive = async (eventId) => {
    try {
      setSaving(true);
      setError('');
      await toggleAdminEventActive(eventId);
      await loadData();
      showSuccess(t('eventStatusUpdated'));
    } catch (err) {
      setError(err.response?.data?.detail || t('failedToUpdateEventStatus'));
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
          <p>{t('loadingEventsManagement')}</p>
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
            <h1>{t('eventsManagement')}</h1>
            <p className={styles.subtitle}>{t('eventsManagementSubtitle')}</p>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <section className={styles.chartSection} style={{ marginTop: 0 }}>
          <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>{t('publicPageVisibility')}</h3>
          <p style={{ color: '#94a3b8' }}>
            {t('currentStatus')}: <strong style={{ color: showEventsPage ? '#34d399' : '#fca5a5' }}>{showEventsPage ? t('visible') : t('hidden')}</strong>
          </p>
          <button
            className={styles.filterBtn}
            onClick={handleVisibilityChange}
            disabled={saving}
            style={{ marginTop: '0.75rem' }}
          >
            {showEventsPage ? t('hideEventsPage') : t('showEventsPage')}
          </button>
        </section>

        <section className={styles.chartSection}>
          <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>{t('createNewEvent')}</h3>
          <form onSubmit={handleCreateEvent} style={{ display: 'grid', gap: '0.9rem' }}>
            <input
              type="text"
              placeholder={t('eventTitle')}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
            />
            <textarea
              placeholder={t('eventDescriptionOptional')}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
            />
            <input
              type="text"
              placeholder={t('eventLocationOptional')}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
              />
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
              />
            </div>
            <label style={{ color: '#cbd5e1' }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                style={{ marginInlineEnd: '8px' }}
              />
              {t('activeEvent')}
            </label>
            <button className={styles.filterBtn} type="submit" disabled={saving}>
              {t('createEvent')}
            </button>
          </form>
        </section>

        <section className={styles.chartSection}>
          <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>{t('allEvents')} ({events.length})</h3>
          {events.length === 0 ? (
            <p style={{ color: '#94a3b8', marginBottom: 0 }}>{t('noEventsYet')}</p>
          ) : (
            <div className={styles.bookingsList}>
              {events.map((event) => (
                <div key={event.id} className={styles.statCard} style={{ textAlign: 'left', padding: '1.25rem' }}>
                  <h4 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '0.7rem' }}>{event.title}</h4>
                  <p className={styles.subtitle}>{t('startLabel')}: {formatDateTime(event.start_time)}</p>
                  <p className={styles.subtitle}>{t('endLabel')}: {formatDateTime(event.end_time)}</p>
                  {event.location && <p className={styles.subtitle}>{t('location')}: {event.location}</p>}
                  {event.description && <p className={styles.subtitle}>{event.description}</p>}
                  <p style={{ color: event.is_active ? '#34d399' : '#fca5a5', fontWeight: 700 }}>
                    {event.is_active ? t('active') : t('inactive')}
                  </p>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button
                      className={styles.filterBtn}
                      onClick={() => handleToggleEventActive(event.id)}
                      disabled={saving}
                    >
                      {event.is_active ? t('deactivate') : t('activate')}
                    </button>
                    <button
                      className={styles.deleteUserBtn}
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={saving}
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
