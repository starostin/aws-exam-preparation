import type { CSSProperties } from 'react';

export default function HomePage() {
  return (
    <section style={styles.content}>
      <h2 style={styles.contentTitle}>Main Page</h2>
      <p style={styles.contentText}>
        Features are being built. Use the sidebar links to move between available sections.
      </p>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  content: {
    padding: '0.25rem',
  },
  contentTitle: {
    margin: 0,
    color: '#163c68',
    fontSize: '1.35rem',
  },
  contentText: {
    margin: '0.7rem 0 0',
    color: '#35567d',
    maxWidth: '62ch',
    lineHeight: 1.6,
  },
};
