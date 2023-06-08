import React from "react";
import { useState, useRef } from "react";
import defaultAvatar from "./サラリーマン.svg";
import firebaseConfig from "./Api.env"

import "firebase/firestore";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, doc,
  setDoc, updateDoc, deleteDoc, orderBy, limit, query as firestoreQuery, 
} from "firebase/firestore";

import { serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
require("firebase/auth");



// const timestamp = firebase.firestore.FieldValue.serverTimestamp();





firebase.initializeApp(firebaseConfig);
const firestore = getFirestore(); 

const auth = firebase.auth();

/* Firebase */

function App() {
    const [user] = useAuthState(auth);

    return (
        <div className="App">
            <header></header>

            <section>{user ? <ChatRoom /> : <SignIn />}</section>
        </div>
    );
}

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };

    return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
    return (
        auth.currentUser && (
            <button onClick={() => auth.signOut()}>Sign Out</button>
        )
    );
}

function ChatRoom() {

    const dummy = useRef()

   const messagesRef = collection(firestore, "messages");
  const query = firestoreQuery(
    messagesRef,
    orderBy("createdAt", "desc"),
    limit(25)
  );

    const [messages] = useCollectionData(query, { idfield: "id" });

    const [formValue, setFormValue] = useState("");

    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL } = auth.currentUser;

        await addDoc(messagesRef,{
            text: formValue,
            createdAt: serverTimestamp(),
            uid,
            photoURL,
        });

        setFormValue("");

        dummy.current.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <main>
                {messages && messages.map( (msg, index) => <ChatMessage key={ index } message={ msg } /> )}
           
                <div></div>
           
            </main>

            <form onSubmit={sendMessage}>
                <input
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                />

                <button type="submit">送信</button>
            </form>
        </>
    );
}

       function ChatMessage(props) {
           const { text, uid, photoURL } = props.message;
           const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
           
        
       return(
               <div className={`message ${messageClass}`}>
                   <img src={photoURL || defaultAvatar} alt="User Avatar" />
                   <p>{text}</p>
                </div>
            )
       }

export default App;
