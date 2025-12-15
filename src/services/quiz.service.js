import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

// --- SEZIONE FIREBASE (Disattivata) ---
// PASSO 4: Decommenta la riga seguente per importare il servizio Firebase.
// import { FirebaseService } from './firebase.service.js';

// =============================================================================
// PASSO 5: IMPOSTA QUESTA VARIABILE A 'true' PER USARE FIREBASE
// Assicurati di aver completato i passaggi 1-4 prima di procedere.
const USE_FIREBASE = false;
// =============================================================================

const INITIAL_QUESTIONS = [
    {
      questionText: "Quale monumento vedi in questa immagine?",
      imageUrl: "https://picsum.photos/id/1015/600/400",
      options: [
        { text: "Torre Eiffel" },
        { text: "Colosseo" },
        { text: "Statua della Libertà" },
        { text: "Big Ben" }
      ],
      correctAnswerIndex: 1,
      category: "Geografia"
    },
    {
      questionText: "Chi ha scritto 'I Promessi Sposi'?",
      options: [
        { text: "Dante Alighieri" },
        { text: "Alessandro Manzoni" },
        { text: "Giovanni Boccaccio" },
        { text: "Ugo Foscolo" }
      ],
      correctAnswerIndex: 1,
      category: "Letteratura"
    },
    {
      questionText: "In che anno è iniziata la Seconda Guerra Mondiale?",
      options: [
        { text: "1939" }, 
        { text: "1941" }, 
        { text: "1945" }, 
        { text: "1914" }
      ],
      correctAnswerIndex: 0,
      category: "Storia"
    },
    {
      questionText: "Quale di questi animali è un mammifero?",
      options: [
        { text: "Coccodrillo", imageUrl: "https://picsum.photos/id/1074/200/150" },
        { text: "Balena", imageUrl: "https://picsum.photos/id/1020/200/150" },
        { text: "Rana", imageUrl: "https://picsum.photos/id/169/200/150" },
        { text: "Serpente", imageUrl: "https://picsum.photos/id/219/200/150" }
      ],
      correctAnswerIndex: 1,
      category: "Scienza"
    },
    {
      questionText: "Quale fiume attraversa Parigi?",
      options: [
        { text: "Danubio" }, 
        { text: "Senna" }, 
        { text: "Tamigi" }, 
        { text: "Tevere" }
      ],
      correctAnswerIndex: 1,
      category: "Geografia"
    }
];

const QUIZ_STORAGE_KEY = 'quiz-session';
const QUESTIONS_STORAGE_KEY = 'quiz-questions';

export class QuizService {
  // --- SEZIONE FIREBASE (Disattivata) ---
  // firebaseService = inject(FirebaseService); // Decommenta nel PASSO 4
  firestoreIds = new Map(); // Mappa l'indice dell'array all'ID del documento Firestore
  // --- FINE SEZIONE FIREBASE ---

  DEFAULT_QUIZ_DURATION_SECONDS = 45 * 60;

  quizState = signal('notStarted');
  questions = signal([]);
  currentQuizQuestions = signal([]);
  userAnswers = signal(new Map());
  
  timeRemaining = signal(this.DEFAULT_QUIZ_DURATION_SECONDS);
  timerId = null;
  
  selectedCategory = signal(null);

  questionsByCategory = computed(() => {
    const category = this.selectedCategory();
    if (!category) return [];
    return this.questions().filter(q => q.category === category);
  });

  categories = computed(() => {
    const allCategories = this.questions().map(q => q.category);
    return [...new Set(allCategories)];
  });

  score = computed(() => {
    if (this.quizState() !== 'finished') return 0;
    let correctAnswers = 0;
    this.currentQuizQuestions().forEach((q, index) => {
      if (this.userAnswers().get(index) === q.correctAnswerIndex) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  });

  totalQuestions = computed(() => this.currentQuizQuestions().length);

  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  constructor() {
    this.loadQuestions();
    this.loadStateFromStorage();

    effect(() => {
      const state = this.quizState();
      if (state === 'inProgress' || state === 'settings' || state === 'categorySelection') {
        const stateToSave = {
          quizState: state,
          currentQuizQuestions: this.currentQuizQuestions(),
          userAnswers: Array.from(this.userAnswers().entries()),
          timeRemaining: this.timeRemaining(),
          selectedCategory: this.selectedCategory(),
        };
        localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(stateToSave));
      }
    });

    effect(() => {
      if (this.timeRemaining() <= 0 && this.quizState() === 'inProgress') {
        this.submitQuiz();
      }
    });
    
    effect(() => {
      if (!USE_FIREBASE) {
        localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(this.questions()));
      }
    });
  }
  
  async loadQuestions() {
    if (USE_FIREBASE) {
      // --- SEZIONE FIREBASE (Disattivata) ---
      // console.log("Caricamento domande da Firebase...");
      // try {
      //   const questionsFromDb = await this.firebaseService.getQuestions();
      //   this.firestoreIds.clear();
      //   const plainQuestions = questionsFromDb.map((q, index) => {
      //     this.firestoreIds.set(index, q.id);
      //     const { id, ...question } = q;
      //     return question;
      //   });
      //   this.questions.set(plainQuestions);
      // } catch (error) {
      //   console.error("Impossibile caricare le domande da Firebase. Verrà utilizzato il set di domande iniziale.", error);
      //   this.questions.set(INITIAL_QUESTIONS);
      // }
      // --- FINE SEZIONE FIREBASE ---
    } else {
      this.loadQuestionsFromStorage();
    }
  }

  loadStateFromStorage() {
    const savedStateJSON = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (savedStateJSON) {
        try {
            const savedState = JSON.parse(savedStateJSON);
             if (savedState.quizState !== 'notStarted') {
                this.quizState.set(savedState.quizState);
                this.currentQuizQuestions.set(savedState.currentQuizQuestions);
                this.userAnswers.set(new Map(savedState.userAnswers));
                this.timeRemaining.set(savedState.timeRemaining);
                this.selectedCategory.set(savedState.selectedCategory);
                
                if (savedState.quizState === 'inProgress') {
                    this.startTimer();
                }
            }
        } catch (e) {
            console.error("Impossibile analizzare lo stato del quiz dalla memoria", e);
            localStorage.removeItem(QUIZ_STORAGE_KEY);
        }
    }
  }

  loadQuestionsFromStorage() {
      const savedQuestions = localStorage.getItem(QUESTIONS_STORAGE_KEY);
      if (savedQuestions) {
          try {
              const questions = JSON.parse(savedQuestions);
              if (questions && questions.length > 0) {
                  this.questions.set(questions);
              } else {
                  this.questions.set(INITIAL_QUESTIONS);
              }
          } catch(e) {
              console.error("Impossibile analizzare le domande dalla memoria", e);
              this.questions.set(INITIAL_QUESTIONS);
          }
      } else {
          this.questions.set(INITIAL_QUESTIONS);
      }
  }
  
  async generateQuizWithAI(total = 10) {
    // Stub
  }

  goToCategorySelection() {
    this.quizState.set('categorySelection');
  }

  goToSettings(category) {
    this.selectedCategory.set(category);
    this.quizState.set('settings');
  }

  goToAdmin() {
    this.quizState.set('admin');
  }

  goToLogin() {
    this.quizState.set('login');
  }

  startQuiz(length, duration) {
    const categoryQuestions = this.questionsByCategory();
    const shuffled = [...categoryQuestions].sort(() => 0.5 - Math.random());
    this.currentQuizQuestions.set(shuffled.slice(0, length));
    
    this.timeRemaining.set(duration);
    this.userAnswers.set(new Map());
    this.quizState.set('inProgress');
    this.startTimer();
  }

  startTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.timerId = setInterval(() => {
      this.timeRemaining.update(t => t - 1);
    }, 1000);
  }

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
  
  selectAnswer(questionIndex, optionIndex) {
    const newAnswers = new Map(this.userAnswers());
    newAnswers.set(questionIndex, optionIndex);
    this.userAnswers.set(newAnswers);
  }

  submitQuiz() {
    this.stopTimer();
    this.quizState.set('finished');
    localStorage.removeItem(QUIZ_STORAGE_KEY);
  }

  resetQuiz() {
    this.stopTimer();
    this.quizState.set('notStarted');
    this.currentQuizQuestions.set([]);
    this.userAnswers.set(new Map());
    this.selectedCategory.set(null);
    localStorage.removeItem(QUIZ_STORAGE_KEY);
  }
  
  async addQuestion(question) {
    if (USE_FIREBASE) {
      // --- SEZIONE FIREBASE (Disattivata) ---
      // try {
      //   await this.firebaseService.addQuestion(question);
      //   await this.loadQuestions(); // Ricarica per mantenere la consistenza
      // } catch (error) {
      //   console.error("Errore nell'aggiungere la domanda su Firebase:", error);
      //   alert("Impossibile salvare la domanda. Controlla la connessione e la configurazione di Firebase.");
      // }
      // --- FINE SEZIONE FIREBASE ---
    } else {
      this.questions.update(questions => [...questions, question]);
    }
  }
  
  async updateQuestion(updatedQuestion, index) {
    if (USE_FIREBASE) {
      // --- SEZIONE FIREBASE (Disattivata) ---
      // const docId = this.firestoreIds.get(index);
      // if (docId) {
      //   try {
      //     await this.firebaseService.updateQuestion(docId, updatedQuestion);
      //     this.questions.update(questions => {
      //       const newQuestions = [...questions];
      //       newQuestions[index] = updatedQuestion;
      //       return newQuestions;
      //     });
      //   } catch (error) {
      //     console.error("Errore nell'aggiornare la domanda su Firebase:", error);
      //     alert("Impossibile aggiornare la domanda. Controlla la connessione e la configurazione di Firebase.");
      //   }
      // } else {
      //   console.error("ID documento non trovato per l'indice:", index);
      // }
      // --- FINE SEZIONE FIREBASE ---
    } else {
      this.questions.update(questions => {
        const newQuestions = [...questions];
        newQuestions[index] = updatedQuestion;
        return newQuestions;
      });
    }
  }
  
  async deleteQuestion(index) {
    if (USE_FIREBASE) {
      // --- SEZIONE FIREBASE (Disattivata) ---
      // const docId = this.firestoreIds.get(index);
      // if (docId) {
      //    try {
      //       await this.firebaseService.deleteQuestion(docId);
      //       await this.loadQuestions(); // Ricarica per ricalcolare gli indici
      //    } catch (error) {
      //      console.error("Errore nell'eliminare la domanda su Firebase:", error);
      //      alert("Impossibile eliminare la domanda. Controlla la connessione e la configurazione di Firebase.");
      //    }
      // } else {
      //   console.error("ID documento non trovato per l'indice:", index);
      // }
      // --- FINE SEZIONE FIREBASE ---
    } else {
      this.questions.update(questions => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        return newQuestions;
      });
    }
  }
}

Injectable({ providedIn: 'root' })(QuizService);