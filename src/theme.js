import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#aaff00' },
    background: { default: '#0a0a0a', paper: '#121212' },
    divider: '#2a2a2a',
    text: { primary: '#ffffff', secondary: '#888888' },
  },
  typography: {
    fontFamily: '"Pretendard", "Noto Sans KR", "Roboto", sans-serif',
  },
  components: {
    MuiBottomNavigation: {
      styleOverrides: { root: { backgroundColor: '#121212' } },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#666666',
          '&.Mui-selected': { color: '#aaff00' },
        },
      },
    },
  },
});

export default theme;
