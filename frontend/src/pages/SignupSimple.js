import { useState } from 'react';
import { useRouter } from 'next/router';
import { signup } from '@/api';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from '@/styles/AuthSimple.module.css';

export default function Signup() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signup({
        username,
        email,
        phone_number: phone,
        password,
      });
      router.push('/login');
    } catch (err) {
      setError(err.response?.data?.detail || t('signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('heroTitle')}</h1>
          <p className={styles.subtitle}>{t('createYourAccount')}</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('username')}</label>
            <input
              type="text"
              className={styles.input}
              placeholder={t('chooseUsername')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('email')}</label>
            <input
              type="email"
              className={styles.input}
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('phoneOptional')}</label>
            <input
              type="tel"
              className={styles.input}
              placeholder={t('yourPhoneNumber')}
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
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('password')}</label>
            <input
              type="password"
              className={styles.input}
              placeholder={t('strongPassword')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? t('creatingAccount') : t('signup')}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            {t('alreadyHaveAccount')}{' '}
            <Link href="/login" legacyBehavior>
              <a className={styles.link}>{t('login')}</a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
