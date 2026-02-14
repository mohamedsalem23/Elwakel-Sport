import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SlotCard from '@/components/SlotCard';
import Cookies from 'js-cookie';
import {
    fetchUser,
    fetchAdminBookings,
    adminDeleteBooking,
    fetchAdminUsers,
    adminDeleteUser,
    fetchAdminStats,
} from '@/api';
import styles from '@/styles/Dashboard.module.css';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminDashboard() {
    const { t } = useLanguage();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState('analytics');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.replace('/login');
            return;
        }
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const userResponse = await fetchUser();
            setUser(userResponse.data);

            if (!userResponse.data.is_admin) {
                setError(t('accessDeniedAdmin'));
                setTimeout(() => router.push('/dashboard/user'), 2000);
                return;
            }

            await Promise.all([loadBookings(), loadUsers(), loadStats()]);
        } catch (err) {
            console.error('Error fetching admin data:', err);
            setError(t('failedToLoadAdminData'));
            Cookies.remove('token');
            router.replace('/login');
        } finally {
            setLoading(false);
        }
    };

    const loadBookings = async () => {
        try {
            const { data } = await fetchAdminBookings();
            setBookings(data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
        }
    };

    const loadUsers = async () => {
        try {
            const { data } = await fetchAdminUsers();
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const loadStats = async () => {
        try {
            const { data } = await fetchAdminStats();
            setStats(data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        try {
            setError('');
            await adminDeleteBooking(bookingId);
            setBookings(bookings.filter((b) => b.id !== bookingId));
            setSuccessMessage(t('cancelSuccess'));
            setTimeout(() => setSuccessMessage(''), 3000);
            loadStats();
        } catch (err) {
            setError(err.response?.data?.detail || t('failedToDeleteBooking'));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm(t('deleteUserConfirm'))) return;
        try {
            setError('');
            await adminDeleteUser(userId);
            setUsers(users.filter((u) => u.id !== userId));
            setSuccessMessage(t('userDeleted'));
            setTimeout(() => setSuccessMessage(''), 3000);
            loadStats();
            loadBookings();
        } catch (err) {
            setError(err.response?.data?.detail || t('failedToDeleteUser'));
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        if (filterStatus === 'all') return true;
        return booking.status === filterStatus;
    });

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>{t('loadingAdminDashboard')}</p>
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
                        <h1>{t('adminPanel')}</h1>
                        <p className={styles.subtitle}>{t('pitchBooking')}</p>
                        <div style={{ marginTop: '0.8rem' }}>
                            <Link href="/dashboard/events-admin" style={{ color: '#34d399', fontWeight: 700 }}>
                                {t('manageEvents')}
                            </Link>
                            {' | '}
                            <Link href="/dashboard/tournaments-admin" style={{ color: '#34d399', fontWeight: 700 }}>
                                {t('manageTournaments')}
                            </Link>
                        </div>
                    </div>
                    <div className={styles.userInfo}>
                        <p><strong>{t('admin')}:</strong> {user?.username}</p>
                    </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {successMessage && <div className={styles.success}>{successMessage}</div>}

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'analytics' ? styles.active : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        📊 {t('analytics')}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'bookings' ? styles.active : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        📅 {t('bookings')} ({bookings.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 {t('users')} ({users.length})
                    </button>
                </div>

                <div className={styles.tabContent}>
                    {/* ========== ANALYTICS TAB ========== */}
                    {activeTab === 'analytics' && stats && (
                        <div>
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={styles.statValue}>{stats.total_users}</div>
                                    <div className={styles.statLabel}>{t('totalUsers')}</div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statValue}>{stats.total_bookings}</div>
                                    <div className={styles.statLabel}>{t('totalBookings')}</div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statValue} style={{ color: '#10b981' }}>
                                        {stats.active_bookings}
                                    </div>
                                    <div className={styles.statLabel}>{t('activeBookings')}</div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statValue} style={{ color: '#f59e0b' }}>
                                        {stats.past_bookings}
                                    </div>
                                    <div className={styles.statLabel}>{t('pastBookings')}</div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statValue} style={{ color: '#3b82f6' }}>
                                        {stats.confirmed_bookings}
                                    </div>
                                    <div className={styles.statLabel}>{t('confirmed')}</div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statValue} style={{ color: '#ef4444' }}>
                                        {stats.cancelled_bookings}
                                    </div>
                                    <div className={styles.statLabel}>{t('cancelled')}</div>
                                </div>
                            </div>

                            {/* Simple visual bar chart */}
                            <div className={styles.chartSection}>
                                <h3 style={{ color: '#e2e8f0', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
                                    📈 {t('bookingsOverview')}
                                </h3>
                                <div className={styles.barChart}>
                                    <div className={styles.barItem}>
                                        <span className={styles.barLabel}>{t('activeBookings')}</span>
                                        <div className={styles.barTrack}>
                                            <div
                                                className={styles.barFill}
                                                style={{
                                                    width: `${stats.total_bookings ? (stats.active_bookings / stats.total_bookings) * 100 : 0}%`,
                                                    background: 'linear-gradient(90deg, #10b981, #34d399)',
                                                }}
                                            ></div>
                                        </div>
                                        <span className={styles.barValue}>{stats.active_bookings}</span>
                                    </div>
                                    <div className={styles.barItem}>
                                        <span className={styles.barLabel}>{t('pastBookings')}</span>
                                        <div className={styles.barTrack}>
                                            <div
                                                className={styles.barFill}
                                                style={{
                                                    width: `${stats.total_bookings ? (stats.past_bookings / stats.total_bookings) * 100 : 0}%`,
                                                    background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                                                }}
                                            ></div>
                                        </div>
                                        <span className={styles.barValue}>{stats.past_bookings}</span>
                                    </div>
                                    <div className={styles.barItem}>
                                        <span className={styles.barLabel}>{t('cancelled')}</span>
                                        <div className={styles.barTrack}>
                                            <div
                                                className={styles.barFill}
                                                style={{
                                                    width: `${stats.total_bookings ? (stats.cancelled_bookings / stats.total_bookings) * 100 : 0}%`,
                                                    background: 'linear-gradient(90deg, #ef4444, #f87171)',
                                                }}
                                            ></div>
                                        </div>
                                        <span className={styles.barValue}>{stats.cancelled_bookings}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========== BOOKINGS TAB ========== */}
                    {activeTab === 'bookings' && (
                        <div>
                            <div className={styles.filterContainer}>
                                <h2>{t('all')} {t('bookings')}</h2>
                                <div className={styles.filterButtons}>
                                    <button
                                        className={`${styles.filterBtn} ${filterStatus === 'all' ? styles.active : ''}`}
                                        onClick={() => setFilterStatus('all')}
                                    >
                                        {t('all')} ({bookings.length})
                                    </button>
                                    <button
                                        className={`${styles.filterBtn} ${filterStatus === 'confirmed' ? styles.active : ''}`}
                                        onClick={() => setFilterStatus('confirmed')}
                                    >
                                        {t('confirmed')} ({bookings.filter(b => b.status === 'confirmed').length})
                                    </button>
                                    <button
                                        className={`${styles.filterBtn} ${filterStatus === 'cancelled' ? styles.active : ''}`}
                                        onClick={() => setFilterStatus('cancelled')}
                                    >
                                        {t('cancelled')} ({bookings.filter(b => b.status === 'cancelled').length})
                                    </button>
                                </div>
                            </div>

                            {filteredBookings.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>{t('noBookings')}</p>
                                </div>
                            ) : (
                                <div className={styles.bookingsList}>
                                    {filteredBookings.map((booking) => (
                                        <SlotCard
                                            key={booking.id}
                                            booking={booking}
                                            isAdmin={true}
                                            onCancel={() => { }}
                                            onDelete={handleDeleteBooking}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========== USERS TAB ========== */}
                    {activeTab === 'users' && (
                        <div>
                            <h2 style={{ color: '#10b981', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                                👥 {t('users')} ({users.length})
                            </h2>
                            <div className={styles.usersTableWrapper}>
                                <table className={styles.usersTable}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>{t('username')}</th>
                                            <th>{t('email')}</th>
                                            <th>{t('phone')}</th>
                                            <th>{t('status')}</th>
                                            <th>{t('bookings')}</th>
                                            <th>{t('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id}>
                                                <td>{u.id}</td>
                                                <td>
                                                    <strong>{u.username}</strong>
                                                    {u.is_admin && (
                                                        <span style={{
                                                            marginLeft: '8px',
                                                            padding: '2px 8px',
                                                            borderRadius: '8px',
                                                            fontSize: '0.75rem',
                                                            background: '#10b981',
                                                            color: 'white',
                                                        }}>{t('admin')}</span>
                                                    )}
                                                </td>
                                                <td>{u.email}</td>
                                                <td>{u.phone_number || '—'}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        backgroundColor: u.is_active ? '#10b981' : '#ef4444',
                                                        color: 'white',
                                                    }}>
                                                        {u.is_active ? t('active') : t('inactive')}
                                                    </span>
                                                </td>
                                                <td>{u.bookings?.length || 0}</td>
                                                <td>
                                                    {!u.is_admin && (
                                                        <button
                                                            className={styles.deleteUserBtn}
                                                            onClick={() => handleDeleteUser(u.id)}
                                                        >
                                                            🗑️ {t('delete')}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
