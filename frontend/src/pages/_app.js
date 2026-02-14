import '@/styles/globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Hide any Next.js overlays or development indicators
    const style = document.createElement('style');
    style.textContent = `
      [class*="next-"] {
        display: none !important;
      }
      #__next-build-watcher {
        display: none !important;
      }
      [data-nextjs] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    // Remove any elements containing 'N' in a circle (Next.js indicator)
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      if (el.textContent?.trim() === 'N' && el.style) {
        el.style.display = 'none';
      }
    });
  }, []);

  return (
    <LanguageProvider>
      <Component {...pageProps} />
    </LanguageProvider>
  );
}
