import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ logged, children }) => {
    if (!logged) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
