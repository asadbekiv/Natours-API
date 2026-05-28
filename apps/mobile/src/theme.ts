import { MD3LightTheme } from 'react-native-paper';

/** Natours brand palette, sampled from apps/api/public/css/style.css. */
export const colors = {
  brand: '#55c57a',
  brandDark: '#28b487',
  brandLight: '#7ed56f',
  textDark: '#2d3439',
  textMuted: '#777',
  bg: '#fff',
  cardBg: '#fff',
  border: '#eee',
  danger: '#c0392b',
  star: '#f5b631', // warm gold for ratings
};

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.brand,
    onPrimary: '#fff',
    secondary: colors.brandDark,
    background: colors.bg,
    surface: colors.bg,
  },
};
