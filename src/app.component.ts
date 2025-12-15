import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizService } from './services/quiz.service';
import { QuizComponent } from './components/quiz/quiz.component';
import { ResultsComponent } from './components/results/results.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { AuthService } from './services/auth.service';
import { SettingsComponent } from './components/settings/settings.component';
import { ImageModalComponent } from './components/image-modal/image-modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [CommonModule, QuizComponent, ResultsComponent, AdminComponent, LoginComponent, SettingsComponent, ImageModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  quizService = inject(QuizService);
  authService = inject(AuthService);
  
  quizState = this.quizService.quizState;
  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;
  categories = this.quizService.categories;

  selectedImageUrl = signal<string | null>(null);

  startQuizSelection() {
    this.quizService.goToCategorySelection();
  }
  
  selectCategory(category: string) {
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

  openImageModal(url: string): void {
    this.selectedImageUrl.set(url);
  }

  closeImageModal(): void {
    this.selectedImageUrl.set(null);
  }
}