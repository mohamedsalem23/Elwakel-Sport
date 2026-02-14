import Link from 'next/link';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { fetchUser, fetchEventsVisibility, fetchTournamentsVisibility } from '@/api';
import styles from '@/styles/Navbar.module.css';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
    const { t, switchLanguage } = useLanguage();
    const [token, setToken] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showEventsLink, setShowEventsLink] = useState(false);
    const [showTournamentsLink, setShowTournamentsLink] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            const tToken = Cookies.get('token');
            setToken(tToken);

            try {
                const { data: visibility } = await fetchEventsVisibility();
                setShowEventsLink(visibility.show_events_page);
            } catch (err) {
                setShowEventsLink(false);
            }
            try {
                const { data: visibility } = await fetchTournamentsVisibility();
                setShowTournamentsLink(visibility.show_tournaments_page);
            } catch (err) {
                setShowTournamentsLink(false);
            }

            if (tToken) {
                try {
                    const { data } = await fetchUser();
                    setIsAdmin(data.is_admin);
                } catch (err) {
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }

            setLoading(false);
        };

        checkAuth();
    }, [router.pathname]);

    const handleLogout = () => {
        Cookies.remove('token');
        setToken(null);
        setIsAdmin(false);
        router.replace('/login');
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.leftSection}>
                <Link href="/" legacyBehavior>
                    <a className={styles.logo}>{t('heroTitle')}</a>
                </Link>
                <button onClick={switchLanguage} className={styles.langBtn}>
                    {t('languageName')}
                </button>
            </div>

            <div className={`${styles.navLinks} ${isMenuOpen ? styles.navOpen : ''}`}>
                {!loading ? (
                    token ? (
                        <>
                            {isAdmin && (
                                <Link href="/dashboard/admin" legacyBehavior>
                                    <a className={`${styles.btn} ${styles.btnAdmin}`}>
                                        {t('adminPanel')}
                                    </a>
                                </Link>
                            )}
                            {(showEventsLink || isAdmin) && (
                                <Link href="/events" legacyBehavior>
                                    <a className={`${styles.btn} ${styles.btnSecondary}`}>
                                        {t('events')}
                                    </a>
                                </Link>
                            )}
                            {(showTournamentsLink || isAdmin) && (
                                <Link href="/tournaments" legacyBehavior>
                                    <a className={`${styles.btn} ${styles.btnSecondary}`}>
                                        {t('tournaments')}
                                    </a>
                                </Link>
                            )}
                            <Link href="/dashboard/user" legacyBehavior>
                                <a className={`${styles.btn} ${styles.btnSecondary}`}>
                                    {t('myBookings')}
                                </a>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className={`${styles.btn} ${styles.btnLogout}`}
                            >
                                {t('logout')}
                            </button>
                        </>
                    ) : (
                        <>
                            {showEventsLink && (
                                <Link href="/events" legacyBehavior>
                                    <a className={`${styles.btn} ${styles.btnSecondary}`}>
                                        {t('events')}
                                    </a>
                                </Link>
                            )}
                            {showTournamentsLink && (
                                <Link href="/tournaments" legacyBehavior>
                                    <a className={`${styles.btn} ${styles.btnSecondary}`}>
                                        {t('tournaments')}
                                    </a>
                                </Link>
                            )}
                            <Link href="/login" legacyBehavior>
                                <a className={`${styles.btn} ${styles.btnSecondary}`}>
                                    {t('login')}
                                </a>
                            </Link>
                            <Link href="/signup" legacyBehavior>
                                <a className={`${styles.btn} ${styles.btnPrimary}`}>
                                    {t('signup')}
                                </a>
                            </Link>
                        </>
                    )
                ) : null}
            </div>

            <button
                className={styles.hamburger}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle Menu"
            >
                <span className={`${styles.bar} ${isMenuOpen ? styles.barOpen : ''}`}></span>
                <span className={`${styles.bar} ${isMenuOpen ? styles.barOpen : ''}`}></span>
                <span className={`${styles.bar} ${isMenuOpen ? styles.barOpen : ''}`}></span>
            </button>
        </nav>
    );
}
