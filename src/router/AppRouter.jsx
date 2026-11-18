import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProfilePage from '../pages/ProfilePage';
import MyKitchenPage from '../pages/MyKitchenPage';
import HomePage from '../pages/HomePage';
import RecipeDetailsPage from '../pages/RecipeDetailsPage';
import PostRecipePage from '../pages/PostRecipePage';
import LoginPage from '../pages/LoginPage';

function ProtectedRoute({ children }) {
  const { session } = useApp();
  if (!session.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/home" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-kitchen"
        element={
          <ProtectedRoute>
            <MyKitchenPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipes/:recipeID"
        element={
          <ProtectedRoute>
            <RecipeDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/post"
        element={
          <ProtectedRoute>
            <PostRecipePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}