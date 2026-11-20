import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from 'styles/editorial.module.css';

export default function Navigation() {
  const { pathname } = useRouter();
  return (
    <nav className={styles.navigation} aria-label="Principale">
      <Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>Home</Link>
      <Link href="/about" aria-current={pathname === '/about' ? 'page' : undefined}>About</Link>
    </nav>
  );
}
