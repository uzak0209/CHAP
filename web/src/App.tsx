import React from 'react';
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
import Settings from './pages/Settings';
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
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/" element={<Home />} />
              <Route path="/post" element={<Post />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/chat/:roomId" element={<Chat />} />
              <Route path="/create-room" element={<CreateRoom />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/map" element={<Map />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App; 