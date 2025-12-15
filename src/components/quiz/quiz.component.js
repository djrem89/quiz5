import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../services/quiz.service.js';

@Component({
  selector: 'app-quiz',
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizComponent {
  quizService = inject(QuizService);
  imageClicked = output();

  currentQuestionIndex = signal(0);
  
  questions = this.quizService.currentQuizQuestions;
  totalQuestions = this.quizService.totalQuestions;
  userAnswers = this.quizService.userAnswers;

  currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);
  progress = computed(() => {
    const total = this.totalQuestions();
    if (total === 0) return 0;
    return ((this.currentQuestionIndex() + 1) / total) * 100;
  });
  
  timeRemaining = this.quizService.timeRemaining;
  formattedTime = computed(() => {
    const minutes = Math.floor(this.timeRemaining() / 60);
    const seconds = this.timeRemaining() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  nextQuestion() {
    if (this.currentQuestionIndex() < this.totalQuestions() - 1) {
      this.currentQuestionIndex.update(i => i + 1);
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update(i => i - 1);
    }
  }

  selectAnswer(optionIndex) {
    // Impedisce di cambiare la risposta una volta data
    if (this.userAnswers().has(this.currentQuestionIndex())) {
      return;
    }
    this.quizService.selectAnswer(this.currentQuestionIndex(), optionIndex);
  }

  finishQuiz() {
    this.quizService.submitQuiz();
  }

  onImageClick(event, imageUrl) {
    event.stopPropagation();
    this.imageClicked.emit(imageUrl);
  }
}