
export interface QuizOption {
  text: string;
  imageUrl?: string;
}

export interface Question {
  questionText: string;
  imageUrl?: string;
  options: QuizOption[];
  correctAnswerIndex: number;
  category: string;
}

export interface QuizData {
  questions: Question[];
}