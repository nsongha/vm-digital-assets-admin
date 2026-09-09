import type { CSSProperties } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppUi } from '../context/AppUiContext';
import { themeCssVars, useTheme } from '../theme/ThemeContext';
import Header from './Header';
import Sidebar from './Sidebar';
import styles from './AppShell.module.css';

/** Top-level shell — ported from the outer padded/glass wrapper in v3.html. */
export default function AppShell() {
  const { vars } = useTheme();
  const { sbOpen, toggleSidebar } = useAppUi();

  const outerStyle: CSSProperties = {
    background: vars.pageGrad,
    ...(themeCssVars(vars) as unknown as CSSProperties),
  };

  return (
    <div className={styles.outer} style={outerStyle}>
      <div className={styles.glass}>
        <Sidebar open={sbOpen} />
        <main className={styles.main}>
          <Header onToggleSidebar={toggleSidebar} />
          <div className={styles.content}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
