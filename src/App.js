// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login';
import ChatList from './components/chatList';
import Chat from './components/chat';
import VideoCall from './components/vedioCAll';
import CallNotification from './components/callnotifications'; // Import CallNotification
import { AuthProvider } from './context/authContext';

const App = () => {
  const userId = 'currentUserId'; // Replace with actual userId from your auth context or state

  return (
    <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/chats" element={<ChatList />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route
            path="/video-call"
            element={<VideoCall callerId={userId} calleeId="recipientId" />} // Pass the recipientId
          />
        </Routes>
        <CallNotification userId={userId} /> {/* Render CallNotification */}
    </AuthProvider>
  );
};

export default App;
