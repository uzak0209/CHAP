import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSelector } from 'react-redux';
import { Box, AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home, Add, Notifications, Person, Map } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { unreadCount } = useSelector((state) => state.notifications);
    // 認証が必要なページのリスト
    const authRequiredPages = ['/', '/post', '/notifications', '/profile', '/chat', '/create-room', '/settings', '/map'];
    const isAuthRequired = authRequiredPages.includes(location.pathname);
    // 認証が必要なページで未認証の場合はログインページにリダイレクト
    if (isAuthRequired && !isAuthenticated) {
        navigate('/login');
        return null;
    }
    const handleNavigation = (event, newValue) => {
        navigate(newValue);
    };
    return (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', minHeight: '100vh' }, children: [_jsx(AppBar, { position: "static", children: _jsx(Toolbar, { children: _jsx(Typography, { variant: "h6", component: "div", sx: { flexGrow: 1 }, children: "CHAP" }) }) }), _jsx(Box, { component: "main", sx: { flexGrow: 1, pb: 7 }, children: children }), isAuthenticated && (_jsxs(BottomNavigation, { value: location.pathname, onChange: handleNavigation, sx: { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }, children: [_jsx(BottomNavigationAction, { label: "\u30DB\u30FC\u30E0", value: "/", icon: _jsx(Home, {}) }), _jsx(BottomNavigationAction, { label: "\u6295\u7A3F", value: "/post", icon: _jsx(Add, {}) }), _jsx(BottomNavigationAction, { label: "\u901A\u77E5", value: "/notifications", icon: _jsxs(Box, { sx: { position: 'relative' }, children: [_jsx(Notifications, {}), unreadCount > 0 && (_jsx(Box, { sx: {
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
                                    }, children: unreadCount > 99 ? '99+' : unreadCount }))] }) }), _jsx(BottomNavigationAction, { label: "\u30DE\u30C3\u30D7", value: "/map", icon: _jsx(Map, {}) }), _jsx(BottomNavigationAction, { label: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB", value: "/profile", icon: _jsx(Person, {}) })] }))] }));
};
export default Layout;
