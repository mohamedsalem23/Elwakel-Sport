import { useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { login, fetchUser } from '@/api';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from '@/styles/AuthSimple.module.css';

export default function Login() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('username', username);
      data.append('password', password);

      const { data: res } = await login(data);
      Cookies.set('token', res.access_token);

      try {
        const userData = await fetchUser();
        if (userData.data.is_admin) {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/user');
        }
      } catch (err) {
        router.push('/dashboard/user');
      }
    } catch (err) {
      setError(err.response?.data?.detail || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('heroTitle')}</h1>
          <p className={styles.subtitle}>{t('loginToYourAccount')}</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('usernameOrEmail')}</label>
            <input
              type="text"
              className={styles.input}
              placeholder={t('enterUsernameOrEmail')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('password')}</label>
            <input
              type="password"
              className={styles.input}
              placeholder={t('enterPassword')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? t('loading') : t('login')}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            {t('noAccount')}{' '}
            <Link href="/signup" legacyBehavior>
              <a className={styles.link}>{t('signup')}</a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
