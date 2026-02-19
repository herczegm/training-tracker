export const theme = {
  color: {
    bg: '#0B0F14',          // dark navy
    surface: '#101826',     // card background
    border: 'rgba(255,255,255,0.10)',
    text: '#EAF0F7',
    muted: 'rgba(234,240,247,0.65)',
    subtle: 'rgba(234,240,247,0.35)',

    primary: '#22C55E',     // sporty green
    primaryText: '#07110B',
    danger: '#EF4444',
    warn: '#F59E0B',
    info: '#38BDF8',
  },

  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    pill: 999,
  },

  space: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 26,
  },

  text: {
    h1: { fontSize: 26, fontWeight: '900' as const, letterSpacing: 0.2 },
    h2: { fontSize: 18, fontWeight: '900' as const },
    h3: { fontSize: 14, fontWeight: '800' as const, letterSpacing: 0.3 },
    body: { fontSize: 14, fontWeight: '500' as const },
    small: { fontSize: 12, fontWeight: '600' as const },
  },

  shadow: {
    card: {
      // iOS
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      // Android
      elevation: 6,
    },
    cardWeb: {
      // RN Web
      boxShadow: '0px 10px 24px rgba(0,0,0,0.28)',
    }
  },
};
