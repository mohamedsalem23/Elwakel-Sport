import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import BookingCalendar from '@/components/BookingCalendar';
import SlotCard from '@/components/SlotCard';
import Cookies from 'js-cookie';
import {
    fetchUser,
    createBooking,
    fetchUserBookings,
    fetchBookingHistory,
    fetchAllBookings,
    deleteBooking,
} from '@/api';
import styles from '@/styles/Dashboard.module.css';
import { useLanguage } from '@/context/LanguageContext';

export default function UserDashboard() {
    const { t } = useLanguage();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState('bookings');

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.replace('/login');
            return;
        }

        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const { data } = await fetchUser();
            setUser(data);
            await loadBookings();
            await loadAllBookings();
            await loadHistory();
        } catch (err) {
            console.error('Error fetching user:', err);
            setError(t('failedToLoadUser'));
            Cookies.remove('token');
            router.replace('/login');
        } finally {
            setLoading(false);
        }
    };

    const loadBookings = async () => {
        try {
            const { data } = await fetchUserBookings();
            setBookings(data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(t('failedToLoadBookings'));
        }
    };

    const loadHistory = async () => {
        try {
            const { data } = await fetchBookingHistory();
            setHistory(data);
        } catch (err) {
            console.error('Error fetching history:', err);
        }
    };

    const loadAllBookings = async () => {
        try {
            const { data } = await fetchAllBookings();
            setAllBookings(data);
        } catch (err) {
            console.error('Error fetching all bookings:', err);
        }
    };

    const handleBooking = async (bookingData) => {
        try {
            setBookingLoading(true);
            setError('');
            const { data: newBooking } = await createBooking(bookingData);
            setBookings([...bookings, newBooking]);
            await loadAllBookings();
            setSuccessMessage(t('bookingSuccess'));
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            const errorMsg =
                err.response?.data?.detail ||
                t('bookingError');
            setError(errorMsg);
        } finally {
            setBookingLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            setError('');
            await deleteBooking(bookingId);
            setBookings(bookings.filter((b) => b.id !== bookingId));
            await loadAllBookings();
            setSuccessMessage(t('cancelSuccess'));
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.detail || t('failedToCancelBooking');
            setError(errorMsg);
        }
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>{t('loading')}</p>
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
                        <h1>{t('welcome')}, {user?.username}!</h1>
                        <p className={styles.subtitle}>
                            {t('heroSubtitle')}
                        </p>
                    </div>
                    <div className={styles.userInfo}>
                        <p>
                            <strong>{t('emailLabel')}:</strong> {user?.email}
                        </p>
                        {user?.phone_number && (
                            <p>
                                <strong>{t('phone')}:</strong> {user?.phone_number}
                            </p>
                        )}
                    </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {successMessage && (
                    <div className={styles.success}>{successMessage}</div>
                )}

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'bookings' ? styles.active : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        {t('myBookings')} ({bookings.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        {t('bookingHistory')} ({history.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'new' ? styles.active : ''}`}
                        onClick={() => setActiveTab('new')}
                    >
                        {t('bookNewSlot')}
                    </button>
                </div>

                <div className={styles.tabContent}>
                    {activeTab === 'bookings' && (
                        <div>
                            {bookings.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>{t('noBookingsYet')}</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setActiveTab('new')}
                                    >
                                        {t('bookNow')}
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.bookingsList}>
                                    {bookings.map((booking) => (
                                        <SlotCard
                                            key={booking.id}
                                            booking={booking}
                                            isAdmin={false}
                                            onCancel={handleCancelBooking}
                                            onDelete={() => { }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div>
                            {history.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>{t('noHistory')}</p>
                                </div>
                            ) : (
                                <div className={styles.bookingsList}>
                                    {history.map((booking) => (
                                        <SlotCard
                                            key={booking.id}
                                            booking={booking}
                                            isAdmin={false}
                                            onCancel={() => { }}
                                            onDelete={() => { }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'new' && (
                        <BookingCalendar
                            onBook={handleBooking}
                            loading={bookingLoading}
                            existingBookings={allBookings}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
