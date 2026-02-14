import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DynamicBackground from '@/components/DynamicBackground';
import { useLanguage } from '@/context/LanguageContext';
import styles from '@/styles/HomeSimple.module.css';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className={styles.page}>
      <DynamicBackground />
      <Navbar />

      <main className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>{t('welcome')}</span>
            <h1 className={styles.title}>{t('heroTitle')}</h1>
            <p className={styles.subtitle}>
              {t('heroSubtitle')}
            </p>
            <div className={styles.buttons}>
              <Link href="/login" className="btn btn-primary">
                {t('startBooking')}
              </Link>
              <Link href="/signup" className="btn btn-gold">
                {t('joinNow')}
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.ballGlow}></div>
            <div className={styles.ballEmoji}>⚽</div>
          </div>
        </section>

        <section className={styles.features}>
          <h2 className="section-title">{t('whyChooseUs')}</h2>
          <div className={styles.grid}>
            <div className="glass-card">
              <div className={styles.icon}>🏆</div>
              <h3 className={styles.cardTitle}>{t('premiumFields')}</h3>
              <p className={styles.cardText}>{t('premiumFieldsDesc')}</p>
            </div>
            <div className="glass-card">
              <div className={styles.icon}>📅</div>
              <h3 className={styles.cardTitle}>{t('easyBooking')}</h3>
              <p className={styles.cardText}>{t('easyBookingDesc')}</p>
            </div>
            <div className="glass-card">
              <div className={styles.icon}>🔒</div>
              <h3 className={styles.cardTitle}>{t('securePayments')}</h3>
              <p className={styles.cardText}>{t('securePaymentsDesc')}</p>
            </div>
            {/* <div className="glass-card">
              <div className={styles.icon}>📱</div>
              <h3 className={styles.cardTitle}>{t('mobileApp')}</h3>
              <p className={styles.cardText}>{t('mobileAppDesc')}</p>
            </div> */}
          </div>
        </section>

        <section className={styles.contact}>
          <div className={styles.contactContainer}>
            <div className={styles.contactInfo}>
              <h2 className="section-title">{t('contactUs') || 'تواصل معنا'}</h2>
              
              <div className={styles.contactCard}>
                <div className={styles.contactIconWrapper}>
                  <span className={styles.contactIcon}>👤</span>
                </div>
                <div>
                  <h3 className={styles.contactTitle}>مالك الملعب</h3>
                  <p className={styles.contactText}>ضياء الوكيل</p>
                </div>
              </div>

              <div className={styles.contactCard}>
                <div className={styles.contactIconWrapper}>
                  <span className={styles.contactIcon}>📱</span>
                </div>
                <div>
                  <h3 className={styles.contactTitle}>رقم الهاتف</h3>
                  <p className={styles.contactText}>
                    <a href="tel:+201013465505" className={styles.phoneLink}>
                      010 1346 5505
                    </a>
                  </p>
                </div>
              </div>

              <div className={styles.contactCard}>
                <div className={styles.contactIconWrapper}>
                  <span className={styles.contactIcon}>📍</span>
                </div>
                <div>
                  <h3 className={styles.contactTitle}>الموقع</h3>
                  <p className={styles.contactText}>تفتيش أبوسكين</p>
                </div>
              </div>
            </div>

            <div className={styles.mapContainer}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3451.5927396819126!2d31.159397!3d31.408469!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sElwakel%20Sport!2s31.408469,31.159397!5e0!3m2!1sar!2seg!4v=1676382000000&hl=ar"
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className="container">
          <p>{t('footerText')}</p>
        </div>
      </footer>
    </div>
  );
}
