import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from '@/styles/SlotCard.module.css';

export default function SlotCard({ booking, isAdmin = false, onCancel, onDelete }) {
    const { t, lang } = useLanguage();

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status) => {
        const statusColor = status === 'confirmed' ? '#10b981' : '#ef4444';
        return (
            <span
                style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    backgroundColor: statusColor,
                    color: 'white',
                    textTransform: 'capitalize',
                }}
            >
                {status}
            </span>
        );
    };

    const handleCancel = () => {
        if (window.confirm(t('cancelConfirm'))) {
            onCancel(booking.id);
        }
    };

    const handleDelete = () => {
        if (window.confirm(t('deleteConfirm'))) {
            onDelete(booking.id);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div>
                    <h3 className={styles.title}>{t('pitchBooking')}</h3>
                    <p className={styles.date}>{formatDateTime(booking.start_time)}</p>
                </div>
                {getStatusBadge(booking.status)}
            </div>

            <div className={styles.details}>
                {booking.booker_name && (
                    <div className={styles.detailItem}>
                        <span className={styles.label}>{t('bookerName')}:</span>
                        <span className={styles.value}>{booking.booker_name}</span>
                    </div>
                )}
                {booking.booker_phone && (
                    <div className={styles.detailItem}>
                        <span className={styles.label}>{t('bookerPhone')}:</span>
                        <span className={styles.value}>{booking.booker_phone}</span>
                    </div>
                )}
                <div className={styles.detailItem}>
                    <span className={styles.label}>{t('start')}:</span>
                    <span className={styles.value}>{formatDateTime(booking.start_time)}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.label}>{t('end')}:</span>
                    <span className={styles.value}>{formatDateTime(booking.end_time)}</span>
                </div>
                {isAdmin && (
                    <div className={styles.detailItem}>
                        <span className={styles.label}>{t('userId')}:</span>
                        <span className={styles.value}>{booking.user_id}</span>
                    </div>
                )}
                <div className={styles.detailItem}>
                    <span className={styles.label}>{t('bookingId')}:</span>
                    <span className={styles.value}>#{booking.id}</span>
                </div>
            </div>

            <div className={styles.actions}>
                {booking.status === 'confirmed' && (
                    <button
                        className={`${styles.btn} ${styles.btnCancel}`}
                        onClick={handleCancel}
                    >
                        {t('cancelBooking')}
                    </button>
                )}
                {isAdmin && (
                    <button
                        className={`${styles.btn} ${styles.btnDelete}`}
                        onClick={handleDelete}
                    >
                        {t('delete')}
                    </button>
                )}
            </div>
        </div>
    );
}
