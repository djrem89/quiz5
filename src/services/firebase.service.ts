
import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { Question } from '../models/quiz.model';

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

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private app: FirebaseApp;
  private db: Firestore;
  private questionsCollection;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
    this.questionsCollection = collection(this.db, 'questions');
  }

  // Recupera tutte le domande da Firestore
  async getQuestions(): Promise<(Question & { id: string })[]> {
    const querySnapshot = await getDocs(this.questionsCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Question),
    }));
  }

  // Aggiunge una nuova domanda
  async addQuestion(question: Question): Promise<void> {
    await addDoc(this.questionsCollection, question);
  }

  // Aggiorna una domanda esistente
  async updateQuestion(id: string, question: Question): Promise<void> {
    const questionDoc = doc(this.db, 'questions', id);
    await updateDoc(questionDoc, { ...question });
  }

  // Elimina una domanda
  async deleteQuestion(id: string): Promise<void> {
    const questionDoc = doc(this.db, 'questions', id);
    await deleteDoc(questionDoc);
  }
}
