import React, { useState } from 'react';
import { GrSnapchat } from "react-icons/gr";
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => 
{
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isUpdating, setUpadating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => 
  {
    e.preventDefault();

    try 
    {
      setUpadating(true);
      setError("");
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
    } 
    catch (error) 
    {
      setError(error.message);
    }
    finally
    {
      setUpadating(false);
      navigate("/");
    }
  };

  return (
    <div className='formContainer'>
      <div className="formWrapper">
        <span className="logo"><GrSnapchat className='logoIcon'/></span>
        <span className="title">Login</span>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder='Email' value={email} onChange={e=> setEmail(e.target.value)} />
          <input type="password" placeholder='Password' value={password} onChange={e=> setPassword(e.target.value)}  />
          <input type="submit" value="Sign in" />
          {isUpdating && "Signing in please wait..."}
          {error && <span>Something went wrong : {error}</span>}
        </form>
        <p>You don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  )
}

export default Login;
