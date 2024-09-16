import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../Context/UserContext';

function ProtectedRoute({ element: Component, ...rest }) {
  const { username } = useContext(UserContext);
  
  const isValidUsername = (username) => {
    const regex = /^[a-zA-Z0-9]{2,15}$/;
    return regex.test(username);
  };

  return (
    isValidUsername(username) ? ( <Component {...rest} />) : ( <Navigate to="/" /> )
  );
}

export default ProtectedRoute;
