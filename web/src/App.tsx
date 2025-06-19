import React from 'react';
import { Routes, Route } from 'react-router-dom';

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

function App() {
  return (
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
  );
}

export default App; 