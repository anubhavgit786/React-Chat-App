import React, { useState, useEffect, useRef } from 'react';
import { GrSnapchat } from "react-icons/gr";
import { RiLogoutCircleRFill } from "react-icons/ri";
import Img from "../img/img.png";
import Attach from "../img/attach.png";
import { IoSendSharp } from "react-icons/io5";
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { collection, query, where, getDocs, setDoc, doc, updateDoc, serverTimestamp, getDoc, onSnapshot, arrayUnion, Timestamp } from 'firebase/firestore';
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const Navbar = ()=>
{
  const { logout, currentUser } = useAuth();
  return (
  <div className='navbar'>
    <span className="logo">
      <GrSnapchat className='logoIcon'/>
    </span>
    <div className='user'>
      <img src={currentUser.photoURL} alt={currentUser.displayName} />
      <span>{currentUser.displayName}</span>
      <button onClick={logout}><RiLogoutCircleRFill/></button>
    </div>
  </div>)
}

const SearchResults = ({ user, onCloseSearchResults })=>
{
  const { currentUser } = useAuth();

  const handleSelect = async ()=>
  {
    try 
    {
      //check whether the group(chats in firestore) exists, if not create
      const combinedId = currentUser.uid > user.uid ? (currentUser.uid + user.uid) : (user.uid + currentUser.uid);
      const res = await getDoc(doc(db, "chats", combinedId));
      if(!res.exists())
      {
        //create a chat in chats collection
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        //create user chats
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }

    } 
    catch (error) 
    {
      console.log("Error: " + error.message);  
    }
    finally
    {
      onCloseSearchResults();
    }
  }

  return (   
  <div className='userChat' onClick={handleSelect}>
    <img src={user.photoURL} alt={user.displayName} />
    <div className='userChatInfo'>
      <span>{user.displayName}</span>
    </div>
  </div>)
}


const Searchbar = ()=>
{

  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const handleCloseSearchResults = ()=>
  {
    setUsername("");
    setUsers([]);
  }

  const handleSubmit = async (e)=>
  {
    e.preventDefault();
    try 
    {
      setIsSearching(true);
      setError("");
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("displayName", "==", username));
      const querySnapshot = await getDocs(q); 
      const resultsArray = [];
      
      querySnapshot.forEach((doc) => 
      {
        const userData = doc.data();
        resultsArray.push(userData);
      });

      setUsers(resultsArray);
      setError("");
    } 
    catch (error) 
    {
      console.log(error.message);
      setError(error.message);
    }
    finally
    {
      setUsername("");
      setIsSearching(false);
    }
  }

  return (
  <div className="search">
    <div className="searchForm">
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder='Find a user' value={username} onChange={e=> setUsername(e.target.value)} />
      </form>
    </div>
    { isSearching && (<div className='userChat'>Searching ...</div>)}
    { !isSearching && !error && users.map((user)=> <SearchResults key={user.uid} user={user} onCloseSearchResults={handleCloseSearchResults} /> ) }
    { error && (<div className='userChat'><span>{error}</span></div>)}
  </div>)
}

const Chats = () => {
  const [chats, setChats] = useState([]);

  const { currentUser } = useAuth();
  const { dispatch } = useChat();

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setChats(doc.data());
      });

      return () => {
        unsub();
      };
    };

    currentUser.uid && getChats();
  }, [currentUser.uid]);

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  return (
    <div className="chats">
      {Object.entries(chats)?.sort((a,b)=>b[1].date - a[1].date).map((chat) => (
        <div
          className="userChat"
          key={chat[0]}
          onClick={() => handleSelect(chat[1].userInfo)}
        >
          <img src={chat[1].userInfo.photoURL} alt="" />
          <div className="userChatInfo">
            <span>{chat[1].userInfo.displayName}</span>
            <p>{chat[1].lastMessage?.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};


const Sidebar = ()=>
{
  return(
  <div className='sidebar'>
    <Navbar/>
    <Searchbar/>
    <Chats/>
  </div>);
}


const Message = ({ message }) => {
  const { currentUser } = useAuth();
  const { data } = useChat();

  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  return (
    <div
      ref={ref}
      className={`message ${message.senderId === currentUser.uid && "owner"}`}
    >
      <div className="messageInfo">
        <img
          src={
            message.senderId === currentUser.uid
              ? currentUser.photoURL
              : data.user.photoURL
          }
          alt=""
        />
        <span>just now</span>
      </div>
      <div className="messageContent">
        { message.text && (<p>{message.text}</p>)}
        {message.img && <img src={message.img} alt="" />}
      </div>
    </div>
  );
};

const Messages = ()=>
{
  const [messages, setMessages] = useState([]);
  const { data } = useChat();

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      doc.exists() && setMessages(doc.data().messages);
    });

    return () => {
      unSub();
    };
  }, [data.chatId]);

  return (
    <div className="messages">
    {messages.map((m) => (
      <Message message={m} key={m.id} />
    ))}
  </div>)
}

const Input = ()=>
{
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);

  const { currentUser } = useAuth();
  const { data } = useChat();

  const handleSend = async () => {
    if (img) {
      const storageRef = ref(storage, uuid());

      const uploadTask = uploadBytesResumable(storageRef, img);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
  
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
            default:
                console.log('Invalid case');
          }
        },
        (error) => {
          console.log('Error: ' + error.message);

        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                id: uuid(),
                text,
                senderId: currentUser.uid,
                date: Timestamp.now(),
                img: downloadURL,
              }),
            });
          });
        }
      );
    } else {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
        }),
      });
    }

    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    setText("");
    setImg(null);
  };
  return(
    <div className='input'>
      <input type='text' placeholder='Type something...' onChange={(e) => setText(e.target.value)} value={text}/>
      <div className="send">
        <img src={Attach} alt='' />
        <input type='file' style={{display: "none"}} id='file' onChange={(e) => setImg(e.target.files[0])} />
        <label htmlFor='file'>
          <img src={Img} alt='' />
        </label>
        <button onClick={handleSend}><IoSendSharp/></button>
      </div>
    </div>)
}

const Chat = ()=>
{
  const { data } = useChat();
  const { user } = data; 
  return(
  <div className='chat'>
    <div className="chatInfo">
      <span>{user.displayName}</span>
      <img src={user.photoURL} alt={user.displayName} />
    </div>
    { user && (<Messages/>)}
    <Input/>
  </div>);
}

const Home = () => {
  return (
    <div className='home'>
      <div className="container">
        <Sidebar/>
        <Chat/>
      </div>
    </div>
  )
}

export default Home
