import styles from '@/styles/DynamicBackground.module.css';

export default function DynamicBackground() {
    return (
        <div className={styles.container}>
            <div className={styles.pitch}>
                <div className={styles.stripes}></div>
                <div className={styles.glows}>
                    <div className={styles.glow1}></div>
                    <div className={styles.glow2}></div>
                </div>
                <div className={styles.particles}>
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className={styles.particle} style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            opacity: Math.random() * 0.5
                        }}></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
