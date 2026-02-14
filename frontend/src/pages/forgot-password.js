import { useState } from 'react';
import { forgotPassword } from '@/api';
import Navbar from '@/components/Navbar';
import DynamicBackground from '@/components/DynamicBackground';
import { useLanguage } from '@/context/LanguageContext';
import styles from '@/styles/AuthSimple.module.css';

export default function ForgotPassword() {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await forgotPassword(email);
            setMessage(t('resetLinkSent'));
        } catch (err) {
            setError(err.response?.data?.detail || t('failedToSendResetLink'));
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

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('email')}</label>
                        <input
                            type="email"
                            className={styles.input}
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className={styles.btn} disabled={loading}>
                        {loading ? '...' : t('sendResetLink')}
                    </button>
                </form>
            </div>
        </div>
    );
}
