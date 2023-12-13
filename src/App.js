import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from "./pages/Register";
import Login from './pages/Login';
import Home from './pages/Home';
import ProtectedRoute from './pages/ProtectedRoute';
import "./style.scss";


const App = () => 
{
  return (
    <Router>
      <Routes>
        <Route path="/" >
          <Route index element={<ProtectedRoute><Home/></ProtectedRoute>} />
          <Route path='login' element={<Login/>} />
          <Route path='register' element={<Register/>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
