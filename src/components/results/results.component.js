import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../services/quiz.service.js';

@Component({
  selector: 'app-results',
  imports: [CommonModule],
  templateUrl: './results.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsComponent {
  quizService = inject(QuizService);
  score = this.quizService.score;
  totalQuestions = this.quizService.totalQuestions;

  percentage = computed(() => {
    const total = this.totalQuestions();
    return total > 0 ? Math.round((this.score() / total) * 100) : 0;
  });

  resultMessage = computed(() => {
    const p = this.percentage();
    if (p >= 90) return "Eccezionale! Sei un vero genio!";
    if (p >= 70) return "Ottimo lavoro! Conosci molto bene l'argomento.";
    if (p >= 50) return "Buon risultato! Continua così.";
    return "Non male! Un po' di pratica in più e farai faville.";
  });

  tryAgain() {
    this.quizService.resetQuiz();
  }
}