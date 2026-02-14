import { useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { login, fetchUser } from '@/api';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from '@/styles/AdminLogin.module.css';

export default function AdminLogin() {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('username', formData.username);
            data.append('password', formData.password);

            const { data: res } = await login(data);
            Cookies.set('token', res.access_token);

            const userData = await fetchUser();
            if (!userData.data.is_admin) {
                setError(t('noAdminPrivileges'));
                Cookies.remove('token');
                return;
            }

            router.push('/dashboard/admin');
        } catch (err) {
            setError(err.response?.data?.detail || t('adminLoginFailed'));
            Cookies.remove('token');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className={styles.background}></div>

            <div className={styles.container}>
                <div className={styles.loginCard}>
                    <div className={styles.header}>
                        <div className={styles.icon}>ADMIN</div>
                        <h1 className={styles.title}>{t('adminPortal')}</h1>
                        <p className={styles.subtitle}>{t('managementControlCenter')}</p>
                    </div>

                    {error && (
                        <div className={styles.errorAlert}>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="username" className={styles.label}>
                                {t('adminUsername')}
                            </label>
                            <input
                                id="username"
                                className={styles.input}
                                type="text"
                                placeholder={t('enterAdminUsername')}
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password" className={styles.label}>
                                {t('password')}
                            </label>
                            <input
                                id="password"
                                className={styles.input}
                                type="password"
                                placeholder={t('enterPassword')}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? t('verifying') : t('loginAsAdmin')}
                        </button>
                    </form>

                    <div className={styles.infoBox}>
                        <h3>{t('defaultAdminCredentials')}</h3>
                        <p><strong>{t('username')}:</strong> <code>admin</code></p>
                        <p><strong>{t('password')}:</strong> <code>Admin@123</code></p>
                        <p className={styles.warning}>{t('changeCredentialsWarning')}</p>
                    </div>

                    <div className={styles.footer}>
                        <Link href="/" legacyBehavior>
                            <a className={styles.backLink}>{t('backToHome')}</a>
                        </Link>
                        <span className={styles.divider}>|</span>
                        <Link href="/login" legacyBehavior>
                            <a className={styles.userLoginLink}>{t('userLogin')}</a>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
