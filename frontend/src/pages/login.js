import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { login, fetchUser } from '@/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DynamicBackground from '@/components/DynamicBackground';
import { useLanguage } from '@/context/LanguageContext';
import styles from '@/styles/AuthSimple.module.css';

export default function Login() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      router.replace('/dashboard/user');
    }

    // Check for token in URL (from Google callback)
    if (router.query.token) {
      Cookies.set('token', router.query.token);
      fetchUserDetails();
    }
  }, [router.query]);

  const fetchUserDetails = async () => {
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
  };

  const handleGoogleLogin = () => {
    const apiBase = typeof window !== 'undefined'
      ? `http://${window.location.hostname}:8000`
      : 'http://localhost:8000';
    window.location.href = `${apiBase}/google/login`;
  };

  const handleSubmit = async (e) => {
    // ... existing handleSubmit logic ...
    // Note: I'll replace the whole handleSubmit to ensure it's clean
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('username', username);
      data.append('password', password);

      const { data: res } = await login(data);
      Cookies.set('token', res.access_token);
      await fetchUserDetails();
    } catch (err) {
      console.error('Login error details:', err.response?.data);
      const detail = err.response?.data?.detail;
      setError(detail || t('loginError') || t('loginFailed'));
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
          <h1 className={styles.title}>{t('login')}</h1>
          <p className={styles.subtitle}>{t('welcome')}</p>
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? '...' : t('login')}
          </button>
        </form>

        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          <button
            onClick={handleGoogleLogin}
            className={styles.btn}
            style={{ backgroundColor: '#fff', color: '#000', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <img src="/google-icon.svg" alt="Google" width="20" height="20" />
            {t('loginWithGoogle')}
          </button>
        </div>

        <div className={styles.footer}>
          <p>
            <Link href="/forgot-password" className={styles.link}>
              {t('forgotPassword')}
            </Link>
          </p>
          <p>
            {t('noAccount')}{' '}
            <Link href="/signup" className={styles.link}>
              {t('signup')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
