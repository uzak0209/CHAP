import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store';
// Components
import Layout from './components/Layout';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Post from './pages/Post';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import CreateRoom from './pages/CreateRoom';
import Settings from './pages/Setting';
import AdminDashboard from './pages/AdminDashboard';
import Map from './pages/Map';
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});
function App() {
    return (_jsx(Provider, { store: store, children: _jsxs(ThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), _jsx(Router, { children: _jsx(Layout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/onboarding", element: _jsx(Onboarding, {}) }), _jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/post", element: _jsx(Post, {}) }), _jsx(Route, { path: "/notifications", element: _jsx(Notifications, {}) }), _jsx(Route, { path: "/profile", element: _jsx(Profile, {}) }), _jsx(Route, { path: "/chat/:roomId", element: _jsx(Chat, {}) }), _jsx(Route, { path: "/create-room", element: _jsx(CreateRoom, {}) }), _jsx(Route, { path: "/settings", element: _jsx(Settings, {}) }), _jsx(Route, { path: "/admin", element: _jsx(AdminDashboard, {}) }), _jsx(Route, { path: "/map", element: _jsx(Map, {}) })] }) }) })] }) }));
}
export default App;
