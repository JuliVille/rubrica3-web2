import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB1t8pwDJkMJRue972Q9otz5yQ9ZbpC6wc",
    authDomain: "bibliote-e14b0.firebaseapp.com",
    projectId: "bibliote-e14b0",
    storageBucket: "bibliote-e14b0.appspot.com",
    messagingSenderId: "64844822815",
    appId: "1:64844822815:web:ab4bcd858d03def036582a"
  };

  firebase.initializeApp(firebaseConfig);

  export default firebase;