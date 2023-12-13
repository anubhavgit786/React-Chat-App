import React, { useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => 
{
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    useEffect(()=>
    {
        if(!currentUser)
        {
            navigate("/login");
        }

    }, [currentUser, navigate])

  return (<>{currentUser ? children : null }</>);
}

export default ProtectedRoute;