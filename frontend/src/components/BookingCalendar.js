import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from '@/styles/BookingCalendar.module.css';

export default function BookingCalendar({ onBook, loading = false, existingBookings = [] }) {
    const { t, lang } = useLanguage();
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [duration, setDuration] = useState('60');
    const [bookerName, setBookerName] = useState('');
    const [bookerPhone, setBookerPhone] = useState('');
    const [error, setError] = useState('');

    const timeSlots = [
        '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
        '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00', '22:00',
    ];

    const durations = [
        { value: '30', label: `30 ${t('minutes')}` },
        { value: '60', label: `1 ${t('hour')}` },
        { value: '90', label: `1.5 ${t('hours')}` },
        { value: '120', label: `2 ${t('hours')}` },
    ];

    const isToday = (dateStr) => {
        const today = new Date();
        const date = parseLocalDate(dateStr);
        return date.toDateString() === today.toDateString();
    };

    const getMinDateTime = () => {
        const now = new Date();
        return formatDateInput(now);
    };

    const parseLocalDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    };

    const formatDateInput = (date) => {
        const pad = (num) => String(num).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };

    const getAvailableTimes = () => {
        if (!selectedDate) return timeSlots;

        const now = new Date();
        const selectedDuration = parseInt(duration, 10);

        return timeSlots.filter((time) => {
            const [hour, minute] = time.split(':');
            const slotStart = parseLocalDate(selectedDate);
            slotStart.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);

            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + selectedDuration);

            // Booking must end by 22:00
            if (slotEnd.getHours() > 22 || (slotEnd.getHours() === 22 && slotEnd.getMinutes() > 0)) {
                return false;
            }

            // If selected date is today, prevent booking in past time
            if (isToday(selectedDate) && slotStart <= now) {
                return false;
            }

            // Hide slots that overlap existing confirmed bookings
            const hasOverlap = existingBookings.some((booking) => {
                if (booking.status && booking.status !== 'confirmed') return false;
                const bookingStart = new Date(booking.start_time);
                const bookingEnd = new Date(booking.end_time);
                return bookingStart < slotEnd && bookingEnd > slotStart;
            });

            return !hasOverlap;
        });
    };

    useEffect(() => {
        if (!selectedTime) return;
        const availableTimes = getAvailableTimes();
        if (!availableTimes.includes(selectedTime)) {
            setSelectedTime('');
        }
    }, [selectedDate, duration, existingBookings, selectedTime]);

    const toLocalIso = (date) => {
        const pad = (num) => String(num).padStart(2, '0');
        const yyyy = date.getFullYear();
        const mm = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());
        const hh = pad(date.getHours());
        const min = pad(date.getMinutes());
        const ss = pad(date.getSeconds());
        // Save as local wall-clock time to keep displayed/admin times identical.
        return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
    };

    const handleBook = () => {
        setError('');

        if (!selectedDate || !selectedTime || !duration) {
            setError(t('selectDetails'));
            return;
        }

        if (!bookerName.trim()) {
            setError(`${t('bookerName')} ${t('requiredField')}`);
            return;
        }

        if (!bookerPhone.trim()) {
            setError(`${t('bookerPhone')} ${t('requiredField')}`);
            return;
        }

        const [hour, minute] = selectedTime.split(':');
        const start = parseLocalDate(selectedDate);
        start.setHours(parseInt(hour), parseInt(minute), 0, 0);

        const end = new Date(start);
        end.setMinutes(end.getMinutes() + parseInt(duration));

        // Check if end time is past 22:00
        if (end.getHours() > 22 || (end.getHours() === 22 && end.getMinutes() > 0)) {
            setError(t('endWarning'));
            return;
        }

        onBook({
            start_time: toLocalIso(start),
            end_time: toLocalIso(end),
            booker_name: bookerName.trim(),
            booker_phone: bookerPhone.trim(),
        });

        // Reset form
        setSelectedDate('');
        setSelectedTime('');
        setDuration('60');
        setBookerName('');
        setBookerPhone('');
    };

    const formatLongDate = (dateStr) => {
        return parseLocalDate(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className={styles.calendar}>
            <h2 className={styles.title}>{t('bookingCalendar')}</h2>

            {error && <div className={styles.error}>{error}</div>}

            {/* Booker Info */}
            <div className={styles.formGroup}>
                <label className={styles.label}>{t('bookerName')}</label>
                <input
                    type="text"
                    className={styles.input}
                    placeholder={t('bookerName')}
                    value={bookerName}
                    onChange={(e) => setBookerName(e.target.value)}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>{t('bookerPhone')}</label>
                <input
                    type="tel"
                    className={styles.input}
                    placeholder="01xxxxxxxxx"
                    value={bookerPhone}
                    onChange={(e) => {
                        // Only allow digits
                        const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                        setBookerPhone(value);
                    }}
                    onKeyPress={(e) => {
                        // Only allow digits
                        if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                        }
                    }}
                    maxLength="11"
                    inputMode="numeric"
                    pattern="[0-9]{11}"
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>{t('selectDate')}</label>
                <input
                    type="date"
                    className={styles.input}
                    min={getMinDateTime()}
                    value={selectedDate}
                    onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTime('');
                    }}
                />
            </div>

            {selectedDate && (
                <>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('selectTime')}</label>
                        <div className={styles.timeGrid}>
                            {getAvailableTimes().map((time) => (
                                <button
                                    key={time}
                                    className={`${styles.timeSlot} ${selectedTime === time ? styles.selected : ''
                                        }`}
                                    onClick={() => setSelectedTime(time)}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                        {isToday(selectedDate) && getAvailableTimes().length === 0 && (
                            <p className={styles.warning}>{t('noSlots')}</p>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('duration')}</label>
                        <select
                            className={styles.select}
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                        >
                            {durations.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedTime && (
                        <div className={styles.summary}>
                            <h3>{t('bookingSummary')}</h3>
                            <p>
                                <strong>{t('bookerName')}:</strong> {bookerName || '—'}
                            </p>
                            <p>
                                <strong>{t('bookerPhone')}:</strong> {bookerPhone || '—'}
                            </p>
                            <p>
                                <strong>{t('date')}:</strong>{' '}
                                {formatLongDate(selectedDate)}
                            </p>
                            <p>
                                <strong>{t('time')}:</strong> {selectedTime}
                            </p>
                            <p>
                                <strong>{t('duration')}:</strong>{' '}
                                {
                                    durations.find((d) => d.value === duration)?.label
                                }
                            </p>
                        </div>
                    )}

                    <button
                        className={styles.bookBtn}
                        onClick={handleBook}
                        disabled={!selectedTime || loading}
                    >
                        {loading ? '...' : t('bookNow')}
                    </button>
                </>
            )}
        </div>
    );
}
