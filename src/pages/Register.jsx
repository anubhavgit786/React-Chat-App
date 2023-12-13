import React, { useState, useRef } from 'react';
import { GrSnapchat } from "react-icons/gr";
import AddAvatar from "../img/addAvatar.png";
import { auth, uploadFile, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore"; 
import { useNavigate, Link } from 'react-router-dom';


const Register = () => 
{
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const fileInputRef = useRef(null);
  const [isUpdating, setUpadating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit  = async (e)=>
  {
    e.preventDefault();
    console.log("name", name);
    console.log("email", email);
    console.log("password", password);
     // Access the file input value using the ref
     const avatar = fileInputRef.current.files[0];
     console.log('avatar', avatar);
    try 
    {
      setError("");
      setUpadating(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = await userCredential.user;
      console.log('user', user);
      const downloadURL = await uploadFile(avatar);
      console.log('downloadURL', downloadURL);
      await updateProfile(user, { displayName: name, photoURL: downloadURL });
      await setDoc(doc(db, "users", user.uid), { uid: user.uid, displayName: name, photoURL: downloadURL, email });
      console.log("user saved");
      await setDoc(doc(db, "userChats", user.uid), { });
      setError("");
    } 
    catch (error) 
    {
      console.log("error is", error.message);
      setError(error.message);
    }
    finally 
    {
      setName("");
      setEmail("");
      setPassword("");
      setUpadating(false);
      navigate("/");
    }
  }

  return (
    <div className='formContainer'>
      <div className="formWrapper">
        <span className="logo"><GrSnapchat className='logoIcon'/></span>
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder='Name' value={name} onChange={e => setName(e.target.value)} required disabled={isUpdating} />
          <input type="email" placeholder='Email'  value={email} onChange={e => setEmail(e.target.value)} required disabled={isUpdating}/>
          <input type="password" placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} required disabled={isUpdating} />
          <input type='file' id='file' ref={fileInputRef} required disabled={isUpdating} />
          <label htmlFor='file'>
            <img src={AddAvatar} alt='avatar' />
            <span>Add an avatar</span>
          </label>
          <input type="submit" value="Sign up" disabled={isUpdating} />
          {isUpdating && "Uploading and compressing the image please wait..."}
          {error && <span>Something went wrong : {error}</span>}
        </form>
        <p>You do have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}

export default Register;
