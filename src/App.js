import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppRouter from './router/AppRouter';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="app-shell">
          <AppRouter />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}