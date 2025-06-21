import React from 'react';
import { useSelector } from 'react-redux';
import { Box, AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home, Add, Notifications, Person, Map } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { RootState } from '../store';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);

  // 認証が必要なページのリスト
  const authRequiredPages = ['/', '/post', '/notifications', '/profile', '/chat', '/create-room', '/settings', '/map'];
  const isAuthRequired = authRequiredPages.includes(location.pathname);

  // ログインページや管理者ページは認証チェックをスキップ
  const noAuthPages = ['/login', '/onboarding', '/admin'];
  const isNoAuthPage = noAuthPages.some(page => location.pathname.startsWith(page));

  // 認証が必要なページで未認証の場合はログインページにリダイレクト
  React.useEffect(() => {
    if (isAuthRequired && !isAuthenticated && !isNoAuthPage) {
      navigate('/login');
    }
  }, [isAuthRequired, isAuthenticated, isNoAuthPage, navigate]);

  // 認証が必要で未認証の場合は何も表示しない
  if (isAuthRequired && !isAuthenticated && !isNoAuthPage) {
    return null;
  }

  const handleNavigation = (event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CHAP
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, pb: 7 }}>
        {children}
      </Box>

      {isAuthenticated && !isNoAuthPage && (
        <BottomNavigation
          value={location.pathname}
          onChange={handleNavigation}
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
        >
          <BottomNavigationAction
            label="ホーム"
            value="/"
            icon={<Home />}
          />
          <BottomNavigationAction
            label="投稿"
            value="/post"
            icon={<Add />}
          />
          <BottomNavigationAction
            label="通知"
            value="/notifications"
            icon={
              <Box sx={{ position: 'relative' }}>
                <Notifications />
                {unreadCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: 'error.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Box>
                )}
              </Box>
            }
          />
          <BottomNavigationAction
            label="マップ"
            value="/map"
            icon={<Map />}
          />
          <BottomNavigationAction
            label="プロフィール"
            value="/profile"
            icon={<Person />}
          />
        </BottomNavigation>
      )}
    </Box>
  );
};

export default Layout; 