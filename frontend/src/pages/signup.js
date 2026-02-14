import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { signup, completeGoogleProfile, fetchUser } from '@/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DynamicBackground from '@/components/DynamicBackground';
import { useLanguage } from '@/context/LanguageContext';
import styles from '@/styles/AuthSimple.module.css';

export default function Signup() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [googleSetupMode, setGoogleSetupMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const googleSetup = router.query.google_setup === '1';
    const tokenFromQuery = typeof router.query.token === 'string' ? router.query.token : null;

    if (googleSetup && tokenFromQuery) {
      Cookies.set('token', tokenFromQuery);
      setGoogleSetupMode(true);
      fetchUser()
        .then(({ data }) => {
          setUsername(data.username || '');
          setEmail(data.email || '');
          setPhone(data.phone_number || '');
        })
        .catch(() => {
          setError(t('failedToLoadGoogleAccountData'));
        });
      return;
    }

    const token = Cookies.get('token');
    if (token) {
      router.replace('/dashboard/user');
    }
  }, [router.query.google_setup, router.query.token, router, t]);

  const handleGoogleSignup = () => {
    const apiBase = typeof window !== 'undefined'
      ? `http://${window.location.hostname}:8000`
      : 'http://localhost:8000';
    window.location.href = `${apiBase}/google/login`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!googleSetupMode) {
      // Username validation (max 100 chars)
      if (!username || username.length > 100) {
        setError('Username must be 1-100 characters');
        return;
      }

      // Email validation
      if (!email || !email.includes('@')) {
        setError('Valid email is required');
        return;
      }
    }

    // Phone validation (Egyptian numbers only)
    const phoneRegex = /^(010|011|012|015)\d{8}$/;
    const cleanPhone = phone.replace(/\s|-/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      setError('Phone must be Egyptian (010, 011, 012, or 015) followed by 8 digits');
      return;
    }

    // Password validation (min 8 chars, mix of letters and numbers)
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (!hasLetter || !hasNumber) {
      setError('Password must contain both letters and numbers');
      return;
    }

    setLoading(true);

    try {
      if (googleSetupMode) {
        await completeGoogleProfile({
          phone_number: phone,
          password,
        });
        router.push('/dashboard/user');
      } else {
        await signup({
          username,
          email,
          phone_number: phone,
          password,
        });
        router.push('/login');
      }
    } catch (err) {
      setError(err.response?.data?.detail || t('signupFailed'));
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
          <h1 className={styles.title}>{googleSetupMode ? t('completeYourAccount') : t('signup')}</h1>
          <p className={styles.subtitle}>
            {googleSetupMode ? t('completeAccountSubtitle') : t('joinNow')}
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {!googleSetupMode && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleGoogleSignup}
              className={styles.btn}
              style={{
                backgroundColor: '#fff',
                color: '#000',
                border: '1px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: 0,
              }}
            >
              <img src="/google-icon.svg" alt="Google" width="20" height="20" />
              {t('signupWithGoogle')}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!googleSetupMode && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('name')}</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder={t('name')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
                <small style={{ color: '#999', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Max 100 characters
                </small>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('email')}</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="e.g. player@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('phone')}</label>
            <input
              type="tel"
              className={styles.input}
              placeholder="01xxxxxxxxx"
              value={phone}
              onChange={(e) => {
                // Only allow digits
                const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                setPhone(value);
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
              disabled={loading}
              required
            />
            <small style={{ color: '#999', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Egyptian phone (010, 011, 012, 015) - 11 digits total
            </small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('password')}</label>
            <input
              type="password"
              className={styles.input}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <small style={{ color: '#999', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Min 8 characters with letters and numbers
            </small>
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? '...' : (googleSetupMode ? t('saveAndContinue') : t('signup'))}
          </button>
        </form>

        {!googleSetupMode && (
          <div className={styles.footer}>
            <p>
              {t('hasAccount')}{' '}
              <Link href="/login" className={styles.link}>
                {t('login')}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
