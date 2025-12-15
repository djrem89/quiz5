import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizService } from './services/quiz.service.js';
import { QuizComponent } from './components/quiz/quiz.component.js';
import { ResultsComponent } from './components/results/results.component.js';
import { AdminComponent } from './components/admin/admin.component.js';
import { LoginComponent } from './components/login/login.component.js';
import { AuthService } from './services/auth.service.js';
import { SettingsComponent } from './components/settings/settings.component.js';
import { ImageModalComponent } from './components/image-modal/image-modal.component.js';

export class AppComponent {
  quizService = inject(QuizService);
  authService = inject(AuthService);
  
  quizState = this.quizService.quizState;
  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;
  categories = this.quizService.categories;

  selectedImageUrl = signal(null);

  startQuizSelection() {
    this.quizService.goToCategorySelection();
  }
  
  selectCategory(category) {
    this.quizService.goToSettings(category);
  }

  goToAdmin() {
    if (this.isAuthenticated()) {
      this.quizService.goToAdmin();
    } else {
      this.quizService.goToLogin();
    }
  }
  
  onAdminLoginSuccess() {
    this.quizService.goToAdmin();
  }

  goHome() {
    this.quizService.resetQuiz();
  }

  logout() {
    this.authService.logout();
    this.quizService.resetQuiz();
  }

  openImageModal(url) {
    this.selectedImageUrl.set(url);
  }

  closeImageModal() {
    this.selectedImageUrl.set(null);
  }
}

Component({
  selector: 'app-root',
  templateUrl: './src/app.component.html',
  imports: [CommonModule, QuizComponent, ResultsComponent, AdminComponent, LoginComponent, SettingsComponent, ImageModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})(AppComponent);