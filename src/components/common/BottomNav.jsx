import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper, Fab, Box, Icon } from '@mui/material';

const NAV_ITEMS = [
  { label: '홈', icon: 'home', path: '/' },
  { label: '탐색', icon: 'explore', path: '/explore' },
  { label: '', icon: null, path: '/post/create' },
  { label: '알림', icon: 'notifications', path: '/notifications' },
  { label: '마이', icon: 'person', path: '/my' },
];

function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const currentValue = NAV_ITEMS.findIndex(item =>
    item.path !== '/post/create' && pathname === item.path
  );

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        zIndex: 100,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
      elevation={0}
    >
      <BottomNavigation
        value={currentValue === -1 ? false : currentValue}
        sx={{ bgcolor: 'background.paper', height: 56, position: 'relative' }}
      >
        {NAV_ITEMS.map((item, idx) =>
          item.path === '/post/create' ? (
            <Box key='fab' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 72 }}>
              <Fab
                size='small'
                onClick={() => navigate('/post/create')}
                sx={{
                  bgcolor: '#aaff00',
                  color: '#000',
                  '&:hover': { bgcolor: '#ccff33' },
                  width: 44,
                  height: 44,
                  minHeight: 'unset',
                }}
              >
                <Icon sx={{ fontSize: 20 }}>add</Icon>
              </Fab>
            </Box>
          ) : (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={<Icon sx={{ fontSize: 22 }}>{item.icon}</Icon>}
              onClick={() => navigate(item.path)}
              sx={{ minWidth: 0 }}
            />
          )
        )}
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;
