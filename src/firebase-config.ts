import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Configuração do Firebase fornecida
export const firebaseConfig = {
  apiKey: "AIzaSyAc-GWQHbCSDdkQl5u6A6RSdXtITBeXx6U",
  authDomain: "keyla-d38d7.firebaseapp.com",
  projectId: "keyla-d38d7",
  storageBucket: "keyla-d38d7.firebasestorage.app",
  messagingSenderId: "163840914362",
  appId: "1:163840914362:web:38e6d004a52366a8526383",
  measurementId: "G-6RLFBCGEGE"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta as ferramentas para usar no resto do site
export const db = getFirestore(app);      // Banco de dados
export const storage = getStorage(app);   // Onde ficam as fotos
export const auth = getAuth(app);         // Sistema de login