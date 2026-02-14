import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { resetPassword } from '@/api';
import Navbar from '@/components/Navbar';
import DynamicBackground from '@/components/DynamicBackground';
import { useLanguage } from '@/context/LanguageContext';
import styles from '@/styles/AuthSimple.module.css';

export default function ResetPassword() {
    const { t } = useLanguage();
    const router = useRouter();
    const { token } = router.query;

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (router.isReady && !token) {
            setError(t('invalidOrMissingToken'));
        }
    }, [router.isReady, token, t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError(t('passwordsDoNotMatch'));
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await resetPassword({ token, new_password: newPassword });
            setMessage(t('passwordResetSuccess'));
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.detail || t('failedToResetPassword'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <DynamicBackground />
            <Navbar />

            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{t('resetPassword')}</h1>
                </div>

                {message && <div style={{ color: '#4caf50', marginBottom: '15px' }}>{message}</div>}
                {error && <div className={styles.error}>{error}</div>}

                {!message && (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t('newPassword')}</label>
                            <input
                                type="password"
                                className={styles.input}
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t('confirmPassword')}</label>
                            <input
                                type="password"
                                className={styles.input}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className={styles.btn} disabled={loading}>
                            {loading ? '...' : t('resetPassword')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
