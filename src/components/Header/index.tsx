import Link from 'next/link';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <div className={styles.container}>
      <Link href="/">
        <div className={styles.content}>
          <img src="/images/logo.svg" alt="logo" />
        </div>
      </Link>
    </div>
  );
}
