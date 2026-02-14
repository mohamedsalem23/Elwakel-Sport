import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from '@/styles/HomeSimple.module.css';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>{t('heroTitle')}</div>
        <div className={styles.navLinks}>
          <Link href="/login" legacyBehavior>
            <a className={styles.navBtn + ' ' + styles.navBtnSecondary}>{t('login')}</a>
          </Link>
          <Link href="/signup" legacyBehavior>
            <a className={styles.navBtn + ' ' + styles.navBtnPrimary}>{t('signup')}</a>
          </Link>
        </div>
      </nav>

      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>{t('heroTitle')}</h1>
            <p className={styles.subtitle}>{t('heroSubtitle')}</p>
            <div className={styles.buttons}>
              <Link href="/login" legacyBehavior>
                <a className={`${styles.btn} ${styles.btnPrimary}`}>{t('startBooking')}</a>
              </Link>
              <Link href="/signup" legacyBehavior>
                <a className={`${styles.btn} ${styles.btnSecondary}`}>{t('joinNow')}</a>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.features}>
          <h2 className={styles.featuresTitle}>{t('whyChooseUs')}</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.icon}>SOCCER</div>
              <h3 className={styles.cardTitle}>{t('premiumFields')}</h3>
              <p className={styles.cardText}>{t('premiumFieldsDesc')}</p>
            </div>
            <div className={styles.card}>
              <div className={styles.icon}>BOOK</div>
              <h3 className={styles.cardTitle}>{t('easyBooking')}</h3>
              <p className={styles.cardText}>{t('easyBookingDesc')}</p>
            </div>
            <div className={styles.card}>
              <div className={styles.icon}>SAFE</div>
              <h3 className={styles.cardTitle}>{t('securePayments')}</h3>
              <p className={styles.cardText}>{t('securePaymentsDesc')}</p>
            </div>
            <div className={styles.card}>
              <div className={styles.icon}>MOBILE</div>
              <h3 className={styles.cardTitle}>{t('mobileApp')}</h3>
              <p className={styles.cardText}>{t('mobileAppDesc')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
