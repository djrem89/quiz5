
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-settings',
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  quizService = inject(QuizService);
  
  selectedCategory = this.quizService.selectedCategory;
  questionsForCategory = this.quizService.questionsByCategory;

  maxQuestions = computed(() => this.questionsForCategory().length);

  numQuestions = signal(Math.min(10, this.maxQuestions()));
  
  // Durations in minutes, stored in seconds
  availableDurations = [
    { label: '15 Min', value: 15 * 60 },
    { label: '30 Min', value: 30 * 60 },
    { label: '45 Min', value: 45 * 60 },
  ];
  selectedDuration = signal(this.availableDurations[2].value);

  onSliderChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    this.numQuestions.set(value);
  }

  setDuration(durationInSeconds: number) {
    this.selectedDuration.set(durationInSeconds);
  }

  startQuiz() {
    if(this.numQuestions() > 0) {
       this.quizService.startQuiz(this.numQuestions(), this.selectedDuration());
    } else {
        alert("Non ci sono abbastanza domande in questa categoria per iniziare un quiz.");
    }
  }
  
  goBack() {
    this.quizService.goToCategorySelection();
  }
}
