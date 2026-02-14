import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import DynamicBackground from '@/components/DynamicBackground';
import { fetchEventsVisibility, fetchPublicEvents } from '@/api';
import { useLanguage } from '@/context/LanguageContext';
import styles from '@/styles/Events.module.css';

export default function EventsPage() {
  const { t, lang } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const { data: visibility } = await fetchEventsVisibility();
        setIsVisible(visibility.show_events_page);

        if (visibility.show_events_page) {
          const { data } = await fetchPublicEvents();
          setEvents(data);
        }
      } catch (err) {
        setError(err.response?.data?.detail || t('failedToLoadEvents'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [t]);

  const formatDateTime = (dateValue) =>
    new Date(dateValue).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className={styles.page}>
      <DynamicBackground />
      <Navbar />
      <main className={styles.container}>
        <section className={styles.header}>
          <h1 className={styles.title}>{t('tournamentsAndEvents')}</h1>
          <p className={styles.subtitle}>{t('allUpcomingActivities')}</p>
        </section>

        {loading && <div className={styles.infoBox}>{t('loadingEvents')}</div>}
        {!loading && error && <div className={styles.errorBox}>{error}</div>}
        {!loading && !error && !isVisible && (
          <div className={styles.infoBox}>{t('eventsHiddenByAdmin')}</div>
        )}
        {!loading && !error && isVisible && events.length === 0 && (
          <div className={styles.infoBox}>{t('noEventsAnnounced')}</div>
        )}

        {!loading && !error && isVisible && events.length > 0 && (
          <section className={styles.grid}>
            {events.map((event) => (
              <article key={event.id} className={styles.card}>
                <h3 className={styles.cardTitle}>{event.title}</h3>
                <p className={styles.meta}>
                  {t('startLabel')}: {formatDateTime(event.start_time)}
                </p>
                <p className={styles.meta}>
                  {t('endLabel')}: {formatDateTime(event.end_time)}
                </p>
                {event.location && <p className={styles.meta}>{t('location')}: {event.location}</p>}
                {event.description && (
                  <p className={styles.description}>{event.description}</p>
                )}
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
