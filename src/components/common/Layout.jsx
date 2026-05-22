import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import BottomNav from './BottomNav.jsx';

function Layout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ flex: 1, pb: '56px' }}>
        <Outlet />
      </Box>
      <BottomNav />
    </Box>
  );
}

export default Layout;
