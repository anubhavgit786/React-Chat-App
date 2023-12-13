import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCaQAOeKhaZBuzCyzAs9UHsgFRjX_tV-Ys",
    authDomain: "chat-app-405fa.firebaseapp.com",
    projectId: "chat-app-405fa",
    storageBucket: "chat-app-405fa.appspot.com",
    messagingSenderId: "364533991381",
    appId: "1:364533991381:web:3329e99f5147cee35bdf5c"
};


export const app = initializeApp(firebaseConfig);

export const auth = getAuth();

export const db = getFirestore(app);

export const storage = getStorage();

export const uploadFile = async (file) => 
{
    const storageRef = ref(storage, 'images/' + file.name);
  
    const uploadTask = uploadBytesResumable(storageRef, file);
  
    return new Promise((resolve, reject) => {
      // Register three observers:
      // 1. 'state_changed' observer, called any time the state changes
      // 2. Error observer, called on failure
      // 3. Completion observer, called on successful completion
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
          // Handle unsuccessful uploads
          reject(error);
        },
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);
            resolve(downloadURL);
          }).catch((error) => {
            reject(error);
          });
        }
      );
    });
  };