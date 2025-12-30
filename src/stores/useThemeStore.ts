import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeId =
  | 'midnight-scholar'
  | 'sakura-zen'
  | 'neural-network'
  | 'morning-coffee'
  | 'arctic-focus'
  | 'retrowave'
  | 'forest-retreat'
  | 'glass-horizon'
  | 'concrete'
  | 'ink-paper';

export interface Theme {
  id: ThemeId;
  name: string;
  nameKo: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textMuted: string;
    accent: string;
    accentSecondary: string;
    border: string;
    shadow: string;
    success: string;
    error: string;
  };
  button: {
    borderRadius: string;
    shadow: string;
    hoverEffect: string;
  };
  font: {
    primary: string;
    display: string;
  };
  effects: {
    blur?: string;
    noise?: boolean;
    glow?: boolean;
  };
}

export const themes: Record<ThemeId, Theme> = {
  'midnight-scholar': {
    id: 'midnight-scholar',
    name: 'Midnight Scholar',
    nameKo: '미드나잇 스칼라',
    colors: {
      primary: '#1a1a2e',
      secondary: '#16213e',
      background: '#0f0f1a',
      surface: '#1a1a2e',
      surfaceAlt: '#252542',
      text: '#e8e8e8',
      textMuted: '#8892b0',
      accent: '#c9a227',
      accentSecondary: '#f4d160',
      border: '#3a3a5a',
      shadow: 'rgba(0, 0, 0, 0.4)',
      success: '#4ade80',
      error: '#f87171',
    },
    button: {
      borderRadius: '4px',
      shadow: '0 2px 8px rgba(201, 162, 39, 0.2)',
      hoverEffect: 'glow',
    },
    font: {
      primary: "'Noto Sans KR', sans-serif",
      display: "'Noto Sans KR', sans-serif",
    },
    effects: {
      glow: true,
    },
  },
  'sakura-zen': {
    id: 'sakura-zen',
    name: 'Sakura Zen',
    nameKo: '사쿠라 젠',
    colors: {
      primary: '#fef6f6',
      secondary: '#fff5f5',
      background: '#fefbfb',
      surface: '#ffffff',
      surfaceAlt: '#fdf2f2',
      text: '#4a4a4a',
      textMuted: '#9ca3af',
      accent: '#f8a5b6',
      accentSecondary: '#a8d8b9',
      border: '#fcd5ce',
      shadow: 'rgba(248, 165, 182, 0.2)',
      success: '#a8d8b9',
      error: '#f8a5b6',
    },
    button: {
      borderRadius: '16px',
      shadow: '0 4px 15px rgba(248, 165, 182, 0.3)',
      hoverEffect: 'lift',
    },
    font: {
      primary: "'Noto Sans KR', sans-serif",
      display: "'Noto Sans KR', sans-serif",
    },
    effects: {},
  },
  'neural-network': {
    id: 'neural-network',
    name: 'Neural Network',
    nameKo: '뉴럴 네트워크',
    colors: {
      primary: '#0a0a0f',
      secondary: '#12121a',
      background: '#050508',
      surface: '#0f0f18',
      surfaceAlt: '#1a1a28',
      text: '#e0e0e0',
      textMuted: '#6b7280',
      accent: '#00f5d4',
      accentSecondary: '#f72585',
      border: '#00f5d4',
      shadow: 'rgba(0, 245, 212, 0.3)',
      success: '#00f5d4',
      error: '#f72585',
    },
    button: {
      borderRadius: '2px',
      shadow: '0 0 20px rgba(0, 245, 212, 0.4)',
      hoverEffect: 'neon',
    },
    font: {
      primary: "'Noto Sans KR', sans-serif",
      display: "'Noto Sans KR', sans-serif",
    },
    effects: {
      glow: true,
    },
  },
  'morning-coffee': {
    id: 'morning-coffee',
    name: 'Morning Coffee',
    nameKo: '모닝 커피',
    colors: {
      primary: '#f5f0e8',
      secondary: '#ebe4d8',
      background: '#faf7f2',
      surface: '#ffffff',
      surfaceAlt: '#f5f0e8',
      text: '#3d3d3d',
      textMuted: '#7a7a7a',
      accent: '#c4956a',
      accentSecondary: '#8fbc8f',
      border: '#d4c9b8',
      shadow: 'rgba(0, 0, 0, 0.08)',
      success: '#8fbc8f',
      error: '#d4756a',
    },
    button: {
      borderRadius: '8px',
      shadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
      hoverEffect: 'subtle',
    },
    font: {
      primary: "'Noto Sans KR', sans-serif",
      display: "'Noto Sans KR', sans-serif",
    },
    effects: {},
  },
  'arctic-focus': {
    id: 'arctic-focus',
    name: 'Arctic Focus',
    nameKo: '아틱 포커스',
    colors: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      background: '#ffffff',
      surface: '#f1f5f9',
      surfaceAlt: '#e2e8f0',
      text: '#0f172a',
      textMuted: '#64748b',
      accent: '#2563eb',
      accentSecondary: '#3b82f6',
      border: '#e2e8f0',
      shadow: 'rgba(0, 0, 0, 0.05)',
      success: '#22c55e',
      error: '#ef4444',
    },
    button: {
      borderRadius: '6px',
      shadow: 'none',
      hoverEffect: 'fill',
    },
    font: {
      primary: "'Noto Sans KR', sans-serif",
      display: "'Noto Sans KR', sans-serif",
    },
    effects: {},
  },
  'retrowave': {
    id: 'retrowave',
    name: 'Retrowave',
    nameKo: '레트로웨이브',
    colors: {
      primary: '#1a1a2e',
      secondary: '#2d1f3d',
      background: '#0f0f1a',
      surface: '#1f1f35',
      surfaceAlt: '#2a2a4a',
      text: '#ffffff',
      textMuted: '#b794f4',
      accent: '#ff6b9d',
      accentSecondary: '#4ecdc4',
      border: '#ff6b9d',
      shadow: 'rgba(255, 107, 157, 0.3)',
      success: '#4ecdc4',
      error: '#ff6b9d',
    },
    button: {
      borderRadius: '0',
      shadow: '4px 4px 0 #ff6b9d',
      hoverEffect: 'retro',
    },
    font: {
      primary: "'Noto Sans KR', sans-serif",
      display: "'Noto Sans KR', sans-serif",
    },
    effects: {
      noise: true,
    },
  },
  'forest-retreat': {
    id: 'forest-retreat',
    name: 'Forest Retreat',
    nameKo: '포레스트 리트릿',
    colors: {
      primary: '#1b4332',
      secondary: '#2d6a4f',
      background: '#0d1f17',
      surface: '#163028',
      surfaceAlt: '#1b4332',
      text: '#e8f5e9',
      textMuted: '#95d5b2',
      accent: '#74c69d',
      accentSecondary: '#d4a373',
      border: '#40916c',
      shadow: 'rgba(116, 198, 157, 0.2)',
      success: '#74c69d',
      error: '#d4a373',
    },
    button: {
      borderRadius: '12px',
      shadow: '0 4px 12px rgba(116, 198, 157, 0.2)',
      hoverEffect: 'organic',
    },
    font: {
      primary: "'Noto Sans KR', sans-serif",
      display: "'Noto Sans KR', sans-serif",
    },
    effects: {},
  },
  'glass-horizon': {
    id: 'glass-horizon',
    name: 'Glass Horizon',
    nameKo: '글래스 호라이즌',
    colors: {
      primary: 'rgba(255, 255, 255, 0.1)',
      secondary: 'rgba(255, 255, 255, 0.05)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      surface: 'rgba(255, 255, 255, 0.15)',
      surfaceAlt: 'rgba(255, 255, 255, 0.1)',
      text: '#ffffff',
      textMuted: 'rgba(255, 255, 255, 0.7)',
      accent: '#ffffff',
      accentSecondary: '#ffd700',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.1)',
      success: '#a7f3d0',
      error: '#fca5a5',
    },
    button: {
      borderRadius: '16px',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      hoverEffect: 'glass',
    },
    font: {
      primary: "'Noto Sans KR', sans-serif",
      display: "'Noto Sans KR', sans-serif",
    },
    effects: {
      blur: '20px',
    },
  },
  'concrete': {
    id: 'concrete',
    name: 'Concrete',
    nameKo: '콘크리트',
    colors: {
      primary: '#e0e5ec',
      secondary: '#d1d9e6',
      background: '#e0e5ec',
      surface: '#e0e5ec',
      surfaceAlt: '#d1d9e6',
      text: '#2d3436',
      textMuted: '#636e72',
      accent: '#6c5ce7',
      accentSecondary: '#00b894',
      border: '#c8d0dc',
      shadow: 'rgba(163, 177, 198, 0.5)',
      success: '#00b894',
      error: '#e17055',
    },
    button: {
      borderRadius: '12px',
      shadow: '6px 6px 12px #b8bec7, -6px -6px 12px #ffffff',
      hoverEffect: 'neumorphic',
    },
    font: {
      primary: "'Noto Sans KR', sans-serif",
      display: "'Noto Sans KR', sans-serif",
    },
    effects: {},
  },
  'ink-paper': {
    id: 'ink-paper',
    name: 'Ink & Paper',
    nameKo: '잉크 앤 페이퍼',
    colors: {
      primary: '#fffef9',
      secondary: '#f7f6f1',
      background: '#fffef9',
      surface: '#ffffff',
      surfaceAlt: '#f7f6f1',
      text: '#1a1a1a',
      textMuted: '#6b6b6b',
      accent: '#e63946',
      accentSecondary: '#1d3557',
      border: '#1a1a1a',
      shadow: 'rgba(0, 0, 0, 0.1)',
      success: '#2a9d8f',
      error: '#e63946',
    },
    button: {
      borderRadius: '0',
      shadow: 'none',
      hoverEffect: 'editorial',
    },
    font: {
      primary: "'Noto Sans KR', sans-serif",
      display: "'Noto Sans KR', sans-serif",
    },
    effects: {},
  },
};

interface ThemeStore {
  currentTheme: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  getTheme: () => Theme;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      currentTheme: 'midnight-scholar',
      setTheme: (themeId) => {
        set({ currentTheme: themeId });
        applyTheme(themeId);
      },
      getTheme: () => themes[get().currentTheme],
    }),
    {
      name: 'brain-training-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.currentTheme);
        }
      },
    }
  )
);

function applyTheme(themeId: ThemeId) {
  const theme = themes[themeId];
  const root = document.documentElement;

  // Apply colors
  root.style.setProperty('--theme-primary', theme.colors.primary);
  root.style.setProperty('--theme-secondary', theme.colors.secondary);
  root.style.setProperty('--theme-background', theme.colors.background);
  root.style.setProperty('--theme-surface', theme.colors.surface);
  root.style.setProperty('--theme-surface-alt', theme.colors.surfaceAlt);
  root.style.setProperty('--theme-text', theme.colors.text);
  root.style.setProperty('--theme-text-muted', theme.colors.textMuted);
  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-accent-secondary', theme.colors.accentSecondary);
  root.style.setProperty('--theme-border', theme.colors.border);
  root.style.setProperty('--theme-shadow', theme.colors.shadow);
  root.style.setProperty('--theme-success', theme.colors.success);
  root.style.setProperty('--theme-error', theme.colors.error);

  // Apply button styles
  root.style.setProperty('--theme-button-radius', theme.button.borderRadius);
  root.style.setProperty('--theme-button-shadow', theme.button.shadow);

  // Apply fonts
  root.style.setProperty('--theme-font-primary', theme.font.primary);
  root.style.setProperty('--theme-font-display', theme.font.display);

  // Apply effects
  root.style.setProperty('--theme-blur', theme.effects.blur || '0');

  // Set theme attribute for CSS selectors
  root.setAttribute('data-theme', themeId);
}
