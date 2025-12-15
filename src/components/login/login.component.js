import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service.js';
import { QuizService } from '../../services/quiz.service.js';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  authService = inject(AuthService);
  quizService = inject(QuizService);
  loginSuccess = output();

  username = signal('');
  password = signal('');
  errorMessage = signal(null);
  isLoading = signal(false);
  showPassword = signal(false);

  onUsernameInput(event) {
    this.username.set(event.target.value);
  }
  
  onPasswordInput(event) {
    this.password.set(event.target.value);
  }

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  login() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    // Simula una chiamata di rete per un'esperienza utente migliore
    setTimeout(() => {
        const success = this.authService.login(this.username(), this.password());
        if (success) {
            this.loginSuccess.emit();
        } else {
            this.errorMessage.set('Nome utente o password non validi.');
        }
        this.isLoading.set(false);
    }, 500);
  }

  goBack() {
    this.quizService.resetQuiz();
  }
}