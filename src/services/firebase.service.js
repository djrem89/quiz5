import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import '../models/quiz.model.js'; // Keep import for module resolution

// --- SEZIONE FIREBASE (Disattivata) ---
// PASSO 3: Sostituisci questo oggetto con la configurazione del tuo progetto Firebase.
// Puoi trovarlo nelle impostazioni del tuo progetto sulla console Firebase.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Sostituisci con la tua chiave API
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
// --- FINE SEZIONE FIREBASE ---

export class FirebaseService {
  app = null;
  db = null;
  questionsCollection = null;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
    this.questionsCollection = collection(this.db, 'questions');
  }

  // Recupera tutte le domande da Firestore
  async getQuestions() {
    const querySnapshot = await getDocs(this.questionsCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  // Aggiunge una nuova domanda
  async addQuestion(question) {
    await addDoc(this.questionsCollection, question);
  }

  // Aggiorna una domanda esistente
  async updateQuestion(id, question) {
    const questionDoc = doc(this.db, 'questions', id);
    await updateDoc(questionDoc, { ...question });
  }

  // Elimina una domanda
  async deleteQuestion(id) {
    const questionDoc = doc(this.db, 'questions', id);
    await deleteDoc(questionDoc);
  }
}

Injectable({
  providedIn: 'root',
})(FirebaseService);