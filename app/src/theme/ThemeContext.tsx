import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { mix } from './color';
import { DEFAULT_THEME, THEME_PAIRS, type ThemePair } from './themes';

export interface ThemeVars {
  ink: string;
  inkHover: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  pageGrad: string;
}

export interface ThemeContextValue {
  theme: ThemePair;
  vars: ThemeVars;
  setTheme: (theme: ThemePair) => void;
  themeOptions: readonly ThemePair[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function deriveVars(theme: ThemePair): ThemeVars {
  const [ink, accent] = theme;
  const inkHover = mix(ink, '#ffffff', 0.14);
  const accentSoft = mix(accent, '#ffffff', 0.78);
  const accentText = mix(accent, '#000000', 0.58);
  const pageGrad =
    'linear-gradient(315deg, ' +
    mix(accent, '#ffffff', 0.55) +
    ' 0%, ' +
    mix(accent, '#ffffff', 0.82) +
    ' 38%, ' +
    mix(ink, '#ffffff', 0.62) +
    ' 100%)';
  return { ink, inkHover, accent, accentSoft, accentText, pageGrad };
}

const THEME_KEY = 'vmAdmin.theme';

/** Đọc chủ đề đã lưu; chỉ chấp nhận cặp có trong danh sách để tránh giá trị rác. */
function readStoredTheme(): ThemePair {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (!raw) return DEFAULT_THEME;
    const found = THEME_PAIRS.find((p) => `${p[0]}|${p[1]}` === raw);
    return found ?? DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePair>(readStoredTheme);

  // Ghi nhớ lựa chọn để mở lại app không phải chọn lại — quan trọng với buổi
  // trình diễn: chuẩn bị chủ đề từ trước, đến lúc trình bày không phải thao tác.
  const setTheme = (next: ThemePair) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_KEY, `${next[0]}|${next[1]}`);
    } catch {
      // Chế độ duyệt riêng tư có thể chặn localStorage — chủ đề vẫn đổi trong phiên.
    }
  };
  const vars = useMemo(() => deriveVars(theme), [theme]);

  // Gắn biến chủ đề lên :root chứ không chỉ lên thẻ bọc của AppShell.
  // Lý do: màn Đăng nhập và Đăng ký nằm NGOÀI AppShell (không có thanh điều hướng),
  // nếu chỉ gắn ở AppShell thì `var(--ink)` trên hai màn đó không có giá trị —
  // nút nền tối hoá trong suốt trong khi chữ vẫn trắng, thành chữ trắng trên nền sáng.
  useEffect(() => {
    const root = document.documentElement;
    const entries = Object.entries(themeCssVars(vars));
    for (const [name, val] of entries) root.style.setProperty(name, val);
    return () => {
      for (const [name] of entries) root.style.removeProperty(name);
    };
  }, [vars]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, vars, setTheme, themeOptions: THEME_PAIRS }),
    [theme, vars],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}

/** CSS custom-property map for the vars, ready to spread onto a style attr. */
export function themeCssVars(vars: ThemeVars): Record<string, string> {
  return {
    '--ink': vars.ink,
    '--ink-hover': vars.inkHover,
    '--accent': vars.accent,
    '--accent-soft': vars.accentSoft,
    '--accent-text': vars.accentText,
  };
}
