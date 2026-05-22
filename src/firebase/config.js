import { initializeApp } from 'firebase/app'

import { getFirestore } from 'firebase/firestore'

import { getAuth } from 'firebase/auth'

const firebaseConfig = {

  apiKey: "AIzaSyCZ-TZzcupMZOE82u0OTDQo3YTpfBNDcE4",

  authDomain: "facturacion-web-e43c1.firebaseapp.com",

  projectId: "facturacion-web-e43c1",

  storageBucket: "facturacion-web-e43c1.firebasestorage.app",

  messagingSenderId: "812238829135",

  appId: "1:812238829135:web:8c4bff099ac9acbe4adc3a"

}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)

export const auth = getAuth(app)