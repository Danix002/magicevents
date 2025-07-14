import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import { ErrorBoundary } from './components/error/ErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
        <AuthProvider>
            <App />
        </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
