import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "@firebase/auth";

const AuthContext = createContext();


const AuthProvider = ({ children })=>
{
    const [currentUser, setCurrentUser] = useState({});

    const logout = ()=>
    {
      signOut(auth);
    }

    useEffect(() => {
      const unsub = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        console.log(user);
      });
  
      return () => {
        unsub();
      };
    }, [])

    return (<AuthContext.Provider value={{ currentUser, logout }}>{children}</AuthContext.Provider>)
}

const useAuth = ()=>
{
  const context = useContext(AuthContext);
  if(context === undefined)
  {
    throw new Error("AuthContext is used outside of the AuthProvider");
  }

  return context;
}

export { AuthProvider, useAuth };