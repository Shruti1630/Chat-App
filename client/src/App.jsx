// client/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";

import LoginPage from "./pages/LoginPage";
import Sidebar from "./components/Sidebar";
import ChatContainer from "./components/ChatContainer";
import RightSidebar from "./components/RightSidebar";

import "./App.css";

// Loading spinner
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading QuickChat...</p>
    </div>
  </div>
);

// Chat Layout
const ChatLayout = () => (
  <div className="flex h-screen bg-gray-50">
    <Sidebar />
    <ChatContainer />
    <RightSidebar />
  </div>
);

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/chat" replace /> : <LoginPage />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/chat" replace /> : <LoginPage />}
      />
      <Route
        path="/chat"
        element={user ? <ChatLayout /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <AppRoutes />
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}
